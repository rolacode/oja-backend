const Buyer = require('../../models/Buyer');
const Vendor1 = require('../../models/Vendor1');
const Dispute = require('../../models/Dispute');
const Location = require('../../models/Location');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connect1DB = require('../../db');


connect1DB();

// Register Buyer
const registerBuyerHandler = async (req, res) => {
  try {
    const { firstname, lastname, email, password, location } = req.body;
    if (typeof firstname !== "string") {
        return res.status(400).json({
          message: "Name must be a string",
        });
      }

      if (typeof lastname !== "string") {
        return res.status(400).json({
          message: "Name must be a string",
        });
      }
  
      if (typeof email !== "string") {
        return res.status(400).json({
          message: "Email must be a string",
        });
      }
  
      if (typeof password !== "string") {
        return res.status(400).json({
          message: "Password must be a string",
        });
      }
  
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }
      
    const hashedPassword = await bcrypt.hash(password, 10);
    const buyer = await Buyer.insertMany({
      firstname,
      lastname,
      email, 
      password: hashedPassword, 
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      }, 
    });

    return res.status(201).json({ message: 'Buyer registered successfully!', buyer});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Retrieve Buyer
// @route GET /v1/Buyers/maxDistance
// @access Private
const findNearbyVendorsHandler = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const vendors = await Vendor1.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    });

    res.status(200).json({ data: vendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Update Vendors
// @route PUT /v1/vendors/:id
// @access Private
const updateBuyerHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { firstname, lastname, email } = req.body;
  
      if (typeof id !== "string") {
        return res.status(400).json({
          message: "Id must be a string",
        });
      }
  
      if (typeof firstname !== "string") {
        res.status(400).json({
          message: "name must be string",
        });
        return;
      }

      if (typeof lastname !== "string") {
        res.status(400).json({
          message: "name must be string",
        });
        return;
      }
  
      if (typeof email !== "string") {
        res.status(400).json({
          message: "email must be string",
        });
        return;
      } else if (!email.includes("@")) {
        res.status(400).json({
          message: "Enter vaild email",
        });
      }
  
      const buyer = await Buyer.findById(id);
      if (!buyer) {
        res.status(404).json({
          message: "Buyer Not Found",
        });
        return;
      }
      buyer.firstname = firstname;
      buyer.lastname = lastname;
      buyer.email = email;
      await buyer.updateOne({firstname, lastname, email});
      res.status(200).json(buyer);
    } catch (error) {
      res.status(500).json({
        message: "error message",
      });
    }
    try {
      const { id } = req.params;
      const updates = req.body;
  
      const updatedBuyer = await Buyer.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedBuyer) {
        return res.status(404).json({ error: 'Buyer not found' });
      }
  
      res.status(200).json({ message: 'Buyer updated successfully', data: updatedBuyer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// @desc Login Buyer
// @route POST /v1/Buyers/login
// @access Public
const loginBuyerHandler = async (req, res) => {
    try {
      const { email, password } = req.body;
      const buyer = await Buyer.findOne({ email });
      if (!buyer || !(await bcrypt.compare(password, buyer.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const payload = { id: buyer.id, email: buyer.email};
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
      return res.json({ message: 'Login successful', token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Search Vendors
const searchVendors1Handler = async (req, res) => {
    try {
      const { lat, lng, radius = 5000 } = req.query;
      const vendors = await Vendor1.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius),
          },
        },
      });
      res.json(vendors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // @desc Retrieve Vendors
// @route GET /v1/vendors
// @access Public
const getVendorsLocationHandler = async (req, res) => {
  const { longitude, latitude, maxDistance, category, rating } = req.query;

  const query = {
    coordinates: {
      $geoWithin: {
        $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], maxDistance / 6378.1], // km to radians
      },
    },
  };

  if (category) query.category = category;
  if (rating) query.rating = { $gte: parseFloat(rating) };

  try {
    const vendors = await Vendor1.find(query);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Create Disputes
// @route POST /v1/admin/disputes
// @access Public
const createBuyerDisputeHandler = async (req, res) => {
  const { orderId, description } = req.body;
  try {
    const dispute = await Dispute.create({ orderId, description });
    res.status(201).json(dispute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  

  

module.exports = {
    registerBuyerHandler,
    findNearbyVendorsHandler,
    updateBuyerHandler,
    loginBuyerHandler,
    searchVendors1Handler,
    getVendorsLocationHandler,
    createBuyerDisputeHandler,
};
