const express = require('express'); 
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const adminRoutes = require('../routes/v1/adminRoutes');
const buyerRoutes = require('../routes/v1/buyerRoutes');
const vendorRoutes = require('../routes/v1/vendorRoutes');
const paymentRoutes = require('../routes/v1/paymentRoutes');
const webhookRoutes = require('../routes/v1/webhookRoutes');
const categoryRoutes = require('../routes/v1/categoryRoutes');
const resetPasswordRoutes = require('../routes/v1/resetPasswordRoutes');
const locationRoutes = require('../routes/v1/locationRoutes');
const helmet = require('helmet');
const connect1DB = require('../db');


const app = express();
app.use(bodyParser.json());
connect1DB();

//middleware
app.use("/upload", express.static(path.join(__dirname, "../uploads")));

app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

console.log("Serving static files from:", path.join(__dirname, "uploads"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/v1/admin', adminRoutes);
app.use('/v1/buyers', buyerRoutes);
app.use('/v1/vendors', vendorRoutes);
app.use('/v1/payments', paymentRoutes);
app.use('/v1/webhook/stripe', webhookRoutes);
app.use('/v1/categories', categoryRoutes);
app.use('/v1/resetPassword', resetPasswordRoutes);
app.use('/v1/locations', locationRoutes);

app.use(helmet());
    

module.exports = app;
