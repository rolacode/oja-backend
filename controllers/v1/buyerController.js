const Buyer = require('../../models/Buyer');
const Vendor1 = require('../../models/Vendor1');
const Order = require('../../models/Order');
const Dispute = require('../../models/Dispute');
const Location = require('../../models/Location');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const connect1DB = require('../../db');


// connect1DB();

// Register Buyer
const registerBuyerHandler = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (typeof firstName !== "string") {
        return res.status(400).json({
          message: "Name must be a string",
        });
      }

      if (typeof lastName !== "string") {
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

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }
      
    const hashedPassword = await bcrypt.hash(password, 10);
    const buyer = await Buyer.insertMany({
      firstName,
      lastName,
      email, 
      password: hashedPassword,
      confirmPassword: hashedPassword,
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

// @desc Update Buyer
// @route PUT /v1/Buyers/:id
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

// @desc Create Order
// @route POST /v1/buyers/order
// @access Public
const createOrderHandler = async (req, res) => {
  try {
      const { buyerId, vendorId, product, status } = (req.body);
      if (typeof buyerId !== "string") {
          return res.status(400).json({
            message: "BuyerId must be a string",
          });
      }

      if (typeof vendorId !== "string") {
          return res.status(400).json({
            message: "VendorId must be a string",
          });
      }

      if (typeof product !== "string") {
          return res.status(400).json({
            message: "Product must be a string",
          });
      }

      const order = await Order.create({ buyerId, vendorId, product, status});
      res.status(201).json(order);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

// @desc Update Order
// @route PUT /v1/buyers/:id
// @access Private
const updateOrderHandler = async (req, res) => {
  try {
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(200).json(updatedOrder);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

// @desc Delete Order
// @route delete /v1/buyers/:id
// @access Private
const deleteOrderHandler = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
      res.status(500).json({ error: err.message });
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
    createOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
};
