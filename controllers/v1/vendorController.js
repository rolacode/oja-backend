const express = require('express');
const mongoose = require('mongoose');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Location = require('../../models/Location')
const bodyParser = require("body-parser");
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const connectDB = require('../../db');
const bcrypt = require('bcrypt');
const Dispute = require('../../models/Dispute');
const Vendor1 = require('../../models/Vendor1');


connectDB();



// @desc Create Vendor
// @route POST /v1/vendors
// @access Public
const createVendorHandler = async (req, res) => {
  try {
    const { businessName, email, password, confirmPassword, location, nin } = req.body;

    if (typeof businessName !== "string") {
      return res.status(400).json({
        message: "Businessname must be a string",
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

    if (typeof confirmPassword !== "string") {
      return res.status(400).json({
        message: "confirm password must be a string",
      });
    }

    if (confirmPassword.length < 8) {
      return res.status(400).json({
        message: "confirm Password must be at least 8 characters",
      });
    } 

    if (typeof nin !== 'number') {
      return res.status(400).json({
        message: "NiN must be a number",
      });
    }

    if (nin.length < 11) {
      return res.status(400).json({
        message: "Password must be at least 11 numbers",
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const vendor = await Vendor1.insertMany({ 
      businessName, 
      email, 
      password: hashedPassword, 
      confirmPassword: hashedPassword,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      nin, 
    });

    return res.status(201).json(vendor);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Retrieve User
// @route GET /v1/users/
// // @access Public
const getProductsByNameHandler = async (req, res) => {
  try {
    let { search } = req.query;

    if (search) {
      if (typeof search !== "string") {
        return res.status(400).json({ message: "Search must be a string" });
      }

      const product = await Product.find({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
      });
      return res.status(200).json(product);
    }

    const products = await Product.find({});
    res.status(200).json(products);
    return;

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
    await vendor.save({businessName, email});
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

// @desc Retrieve Products
// @route GET /v1/vendors/product
// @access Public
const getProductsHandler = async (req, res) => {
  try {
      const products = await Product.find();
      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
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
const getOrdersHandler = async (req, res) => {
    try {
      const orders = await Order.find({ buyerId: req.params.buyerId }).populate('products');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// @desc Retrieve Buyer
// @route GET /v1/vendors/:id
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


  module.exports = {
    createVendorHandler,
    getProductsByNameHandler,
    updateVendorHandler,
    loginVendorHandler,
    deleteProductHandler,
    createProductHandler,
    getProductsHandler,
    getSalesHandler,
    getEarningsHandler,
    getProductHandler,
    getOrdersHandler,
    getBuyerHandler,
    analyticBuyersHandler,
  };