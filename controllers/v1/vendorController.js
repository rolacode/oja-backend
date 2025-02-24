const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Location = require('../../models/Location');
const bodyParser = require("body-parser");
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
// const connect1DB = require('../../db');
const bcrypt = require('bcrypt');
const Dispute = require('../../models/Dispute');
const Vendor1 = require('../../models/Vendor1');
const Buyer = require('../../models/Buyer');

// connect1DB();

// @desc Create Vendor
// @route POST /v1/vendors
// @access Public
const createVendorHandler = async (req, res) => {
  try {
    const { businessName, email, password, confirmPassword, location, nin } = req.body;

    // Validate if businessName is a string
    if (typeof businessName !== "string") {
      return res.status(400).json({ message: "Business name must be a string" });
    }

    // Validate if email is a string and matches email format
    if (typeof email !== "string") {
      return res.status(400).json({ message: "Email must be a string" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    // Validate if password is a string
    if (typeof password !== "string") {
      return res.status(400).json({
        message: "Password must be a string",
      });
    }

    // Validate if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate if password is at least 8 characters long
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Validate location (coordinates as array)
    if (
      !Array.isArray(location?.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some((coord) => typeof coord !== 'number' || isNaN(coord))
    ) {
      return res.status(400).json({ message: "Location must be an array with [latitude, longitude]" });
    }

    // Validate NIN (must be exactly 11 digits)
    if (typeof nin !== "string" || !/^\d{11}$/.test(nin)) {
      return res.status(400).json({ message: "NIN must be exactly 11 digits" });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new vendor document
    const vendor = new Vendor1({
      businessName,
      email,
      password: hashedPassword,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      nin,
    });

    // Save the vendor in the database
    await vendor.save();

    // Generate a verification token
    const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Send the verification email (assuming `sendVerificationEmail` is a defined function)
    sendVerificationEmail(vendor.email, token);

    // Send a successful response
    return res.status(201).json({
      success: true,
      message: 'Vendor registered successfully! Please check your email to verify your account.',
    });

  } catch (error) {
    console.error('Error during registration:', error); 
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again later.',
    });
  }
};



// send verification email controller
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Set to false for TLS (STARTTLS)
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // The generated app password
    },
  });

  const verificationUrl = `${process.env.BASE_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER, // sender address
    to: email, // recipient email
    subject: 'Email Verification',
    html: `
      <h1>Welcome to Our Platform!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `,
  };

  try {
    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


// @desc Retrieve User
// @route GET /v1/users/
// // @access Public
const getProductsByNameHandler = async (req, res) => {
  try {
    const { search } = req.query;

    let products;
    if (search) {
      if (typeof search !== "string") {
        return res.status(400).json({ message: "Search must be a string" });
      }

      products = await Product.find({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
      });
    } else {
      products = await Product.find();
    }

    // Assuming you want to paginate results:
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Slice products for the current page
    const paginatedProducts = products.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      products: paginatedProducts,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// @desc Update Vendors
// @route PUT /v1/vendors/:id
// @access Private
const updateVendorHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessName, email } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Id must be a string",
      });
    }

    if (typeof businessName !== "string") {
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

    const vendor = await Vendor1.findById(id);
    if (!vendor) {
      res.status(404).json({
        message: "Vendor Not Found",
      });
      return;
    }
    vendor.businessName = businessName;
    vendor.email = email;
    await Vendor1.save({businessName, email});
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({
      message: "error message",
    });
  }
};

// @desc Login Vendor
// @route POST /v1/vendors/login
// @access Public
const loginVendorHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor1.findOne({ email });
    if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: vendor.id, email: vendor.email};
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete Vendor
// @route DELETE /v1/vendors/:vendorId
// @access Private
const deleteProductHandler = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();
    return res.status(204).json({product,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Create Product
// @route POST /v1/vendors/:vendorId
// @access Private
const createProductHandler = async (req, res) => {
    const { name, description, price, images, vendorId, categoryId, } = req.body;
    try {
      const product = await Product.create({ name, description, price, images, vendorId, categoryId });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// @desc Fetch All Products with Pagination and Filters
// @route GET /v1/vendors
// @access Public
const getAllProductsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, vendor } = req.query;

    const filter = {};
    if (category) filter.categoryId = category;
    if (vendor) filter.vendorId = vendor;

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('vendorId', 'businessName') // Populate vendor details
      .populate('categoryId', 'name') // Populate category details
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    // Ensure consistent response format
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      products, // Ensure this is an array
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

    
// @desc Retrieve User-sales
// @route GET /v1/vendors/sales/:vendorId
// @access Private
const getSalesHandler = async (req, res) => {
const { vendorId } = req.query;
try {
    const sales = await Order.aggregate([
    { $match: { vendorId: mongoose.Types.ObjectId(vendorId) } },
    { $group: { _id: null, totalSales: { $sum: '$amount' }, totalOrders: { $sum: 1 } } },
    ]);
    res.json(sales);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
  
// @desc Retrieve User-earnings
// @route GET /v1/vendors/earnings/:vendorId
// @access Public
const getEarningsHandler = async (req, res) => {
try {
    const earnings = await Order.aggregate([
    { $match: { vendorId: mongoose.Types.ObjectId(req.params.vendorId) } },
    { $group: { _id: null, totalEarnings: { $sum: '$amount' } } },
    ]);
    res.json(earnings);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
 
// @desc Retrieve products
// @route GET /v1/vendors/product
// @access Public
const getProductHandler = async (req, res) => {
    const { vendorId } = req.query;
    try {
      const products = await Product.find({ vendorId });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// @desc Retrieve Order
// @route POST /v1/Vendors/:buyerId
// @access Private
const getOrderHandler = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyerId vendorId products');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

// @desc Retrieve Buyer
// @route GET /v1/vendors/:id
// @access Public
const getBuyerHandler = async (req, res) => {
  try {
    const buyer = await new Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({
        message: "buyer not found",
      });
    }

    return res.status(200).json(buyer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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

// @desc Retrieve Order
// @route POST /v1/Vendors/order
// @access Private
const getAllOrdersHandler = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({ path: 'buyerId', model: 'Buyer' })
      .populate({ path: 'vendorId', model: 'Vendor1' })
      .populate({ path: 'products', model: 'Product' });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error retrieving orders:', err); // Log the full error
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  createVendorHandler,
  getProductsByNameHandler,
  updateVendorHandler,
  loginVendorHandler,
  deleteProductHandler,
  createProductHandler,
  getAllProductsHandler,
  getSalesHandler,
  getEarningsHandler,
  getProductHandler,
  getOrderHandler,
  getBuyerHandler,
  analyticBuyersHandler,
  getAllOrdersHandler,
};