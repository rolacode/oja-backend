const Buyer = require('../../models/Buyer')
const nodemailer = require('nodemailer');
const Vendor1 = require('../../models/Vendor1');
const Order = require('../../models/Order');
const Dispute = require('../../models/Dispute');
const Location = require('../../models/Location');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const connect1DB = require('../../db');


// connect1DB();

const registerBuyerHandler = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Input validation
    if (typeof firstName !== "string") {
      return res.status(400).json({
        success: false,
        message: "First Name must be a string",
      });
    }

    if (typeof lastName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Last Name must be a string",
      });
    }

    if (typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email must be a string",
      });
    }

    // Check if buyer already exists
    const buyerExists = await Buyer.findOne({ email });
    if (buyerExists) {
      return res.status(400).json({
        success: false,
        message: 'Buyer already exists',
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password must be a string",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new buyer to the database
    const buyer = new Buyer({
      firstName,
      lastName,
      email,
      isVerified: true, // Assuming the buyer is automatically verified
      password: hashedPassword,
    });

    await buyer.save();

    // Generate a verification token
    const token = jwt.sign({ buyerId: buyer._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Send the verification email (assuming `sendVerificationEmail` is a defined function)
    sendVerificationEmail(buyer.email, token);

    // Send a successful response
    return res.status(201).json({
      success: true,
      message: 'Buyer registered successfully! Please check your email to verify your account.',
    });

  } catch (error) {
    console.error('Error during registration:', error); // Log error details for debugging
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
    secure: false, // Set to false for TLS (STARTTLS)
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





const verifyEmailHandler = async (req, res) => {
  const { token } = req.params;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const buyer = await Buyer.findById(decoded.buyerId);

    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    if (buyer.isVerified) {
      return res.status(400).json({ message: 'Buyer already verified' });
    }

    // Mark the buyer as verified
    buyer.isVerified = true;
    await buyer.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
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
      return res.status(401).json({ message: 'Invalid email or password', success: false });
    }

    const payload = { id: buyer.id, email: buyer.email};
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    return res.json({ message: 'Login successful', success: true, token });  // Add success: true
  } catch (error) {
    res.status(400).json({ error: error.message, success: false });
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
    verifyEmailHandler,
    sendVerificationEmail,
};
