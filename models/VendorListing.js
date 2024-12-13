const mongoose = require('mongoose');

const vendorListingSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    featured: { type: Boolean, default: false }, // Featured flag
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('VendorListing', vendorListingSchema);
  