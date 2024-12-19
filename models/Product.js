const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String], // Array of image URLs
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor1' },
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
  });
  module.exports = mongoose.model('Product', productSchema);
  