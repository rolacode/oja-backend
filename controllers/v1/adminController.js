const express = require('express');
const VendorListing = require('../../models/VendorListing')
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const connectDB = require('../../db');
const bcrypt = require('bcrypt');
const Dispute = require('../../models/Dispute');
const Location = require('../../models/Location');
const Admin = require('../../models/Admin');
const Vendor1 = require('../../models/Vendor1');
const Buyer = require('../../models/Buyer');
const Message = require('../../models/Message');

connectDB();



// @desc Create Admin
// @route POST /v1/Admin
// @access Public
const createAdminHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== "string") {
      return res.status(400).json({
        message: "Username must be a string",
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
    const admin = await Admin.insertMany({ username, email, password: hashedPassword });

    return res.status(201).json(admin);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};;

// @desc Retrieve User
// @route GET /v1/users/:id
// @access Public
const getVendorHandler = async (req, res) => {
  try {
    const vendor = await Vendor1.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    return res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Retrieve User
// @route GET /v1/users/
// @access Public
const getVendorsHandler = async (req, res) => {
  try {
    let { search } = req.query;

    if (search) {
      if (typeof search !== "string") {
        return res.status(400).json({ message: "Search must be a string" });
      }

      const vendors = await Vendor1.find({
        where: {
          businessName: {
            [Op.like]: `%${search}%`,
          },
        },
      });
      return res.status(200).json(vendors);
    }

    const vendors = await Vendor1.find({});
    res.status(200).json(vendors);
    return;

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Update Users
// @route PUT /v1/Users/:id
// @access Private
const updateVendorHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessName, email, location, } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Id must be a string",
      });
    }

    if (typeof businessName !== "string") {
      res.status(400).json({
        message: "Business name must be string",
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

    const vendor = await Vendor1.findById(id);
    if (!vendor) {
      res.status(404).json({
        message: "User Not Found",
      });
      return;
    }
    vendor.businessName = businessName;
    vendor.email = email;
    if (location) {
      // Validate Location
      if (!location.coordinates || location.coordinates.length !== 2) {
        return res.status(400).json({ message: "Invalid location format" });
      }
      vendor.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
    }

    await vendor.save({businessName, email, location});
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({
      message: "error message",
    });
  }
};

// @desc Update Admin
// @route PUT /v1/Admins/:id
// @access Private
const updateAdminHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Id must be a string",
      });
    }

    if (typeof username !== "string") {
      res.status(400).json({
        message: "Business name must be string",
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

    const admin = await Admin.findById(id);
    if (!admin) {
      res.status(404).json({
        message: "Admin Not Found",
      });
      return;
    }
    admin.username = username;
    admin.email = email;
    await admin.save({username, email});
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({
      message: "error message",
    });
  }
};

// @desc Login Admin
// @route POST /v1/admins/login
// @access Public
const loginAdminHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: admin.id, email: admin.email};
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete Vendor
// @route DELETE /v1/admin/:vendorId
// @access Private
const deleteVendorHandler = async (req, res) => {
  try {
    const vendor = await Vendor1.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await vendor.deleteOne();
    return res.status(204).json({vendor,
      message: "vendor Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Create Disputes
// @route POST /v1/admin/disputes
// @access Public
// const createUserDisputeHandler = async (req, res) => {
//   const { orderId, description } = req.body;
//   try {
//     const dispute = await Dispute.create({ orderId, description });
//     res.status(201).json(dispute);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// @desc Retrieve location
// @route POST /v1/admin/:vendorId
// @access Private
const getNearbyLocations = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;

    const locations = await Location.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], maxDistance / 6378.1], // Radius in radians
        },
      },
    });

    res.json(locations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

   
// Toggle featured flag

// @desc Update User Status
// @route PUT /v1/admin/vendor-listings/:id/feature
// @access Private
const updateVendorListingsHandler = async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await VendorListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.featured = !listing.featured;
    await listing.save();

    res.json({ message: 'Listing updated successfully', listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
// @desc Update User Status
// @route PUT /v1/admin/users/:userId
// @access Private
const updateBuyerStatusHandler = async (req, res) => {
    const { status } = req.body;
    try {
      const buyer = await Buyer.findByIdAndUpdate(req.params.userId, { status }, { new: true });
      res.json(buyer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  
// @desc Retrieve user transactions
// @route GET /v1/admin/transactions
// @access Private
const buyerTransactionsHandler = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('buyerId vendorId');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
// @desc Retrieve users activity
// @route GET /v1/admin/analytics
// @access Private
const analyticBuyersHandler = async (req, res) => {
  try {
    const buyerCount = await Buyer.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const salesVolume = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({ buyerCount, transactionCount, salesVolume: salesVolume[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Retrieve Vendors activity
// @route GET /v1/admin/analytics
// @access Private
const analyticVendorsHandler = async (req, res) => {
  try {
    const vendorCount = await Vendor1.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const salesVolume = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({ vendorCount, transactionCount, salesVolume: salesVolume[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
// @desc Retrieve vendor-growth
// @route GET /v1/admin/vendor-growth
// @access Private
const vendorGrowthHandler = async (req, res) => {
  try {
    const growth = await Vendor1.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
    res.json(growth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
  
// @desc Update Dispute
// @route PUT /v1/admin/disputes/:disputeId
// @access Private
const updateBuyersDisputeHandler = async (req, res) => {
  const { status, resolution } = req.body;
  try {
    const dispute = await Dispute.findByIdAndUpdate(req.params.disputeId, { status, resolution }, { new: true });
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Retrieve Buyer
// @route GET /v1/Buyers
// @access Public
const getAllBuyersHandler = async (req, res) => {
  try {
    const buyers = await Buyer.find().populate('orders');
    res.status(200).json({ data: buyers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Retrieve Buyer
// @route GET /v1/Buyer/:id
// @access Public
const getBuyerHandler = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    return res.status(200).json(buyer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBuyerHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBuyer = await Buyer.findByIdAndDelete(id);

    if (!deletedBuyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.status(200).json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc Create Notifications
// @route POST /v1/admin/notifications
// @access Private 
const createAdminNotificationHandler = async (req, res) => {
  const { message } = req.body;
  await Message.find();
  // Use WebSocket or a notification service
  io.emit('admin-notification', { message });
  res.json({ status: 'Notification sent' });
};
 

module.exports = {
  createAdminHandler,
  getVendorHandler,
  getVendorsHandler,
  updateVendorHandler,
  updateAdminHandler,
  loginAdminHandler,
  deleteVendorHandler,
  getNearbyLocations,
  updateVendorListingsHandler,
  updateBuyerStatusHandler,
  buyerTransactionsHandler,
  analyticBuyersHandler,
  analyticVendorsHandler,
  vendorGrowthHandler,
  updateBuyersDisputeHandler,
  getAllBuyersHandler,
  getBuyerHandler,
  deleteBuyerHandler,
  createAdminNotificationHandler,
}