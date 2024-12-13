const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: String,
    featured: { type: Boolean, default: false }, // Featured flag
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Category', categorySchema);
  