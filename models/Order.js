const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor1' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    status: { type: String, enum: ['Pending', 'Processing', 'Completed'], default: 'Pending' },
    estimatedDelivery: Date,
  }, {
    timestamps: true
  });
  module.exports = mongoose.model('Order', orderSchema);
  