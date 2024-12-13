const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    status: { type: String, enum: ['Pending', 'Processing', 'Completed'], default: 'Pending' },
    estimatedDelivery: Date,
  });
  module.exports = mongoose.model('Order', orderSchema);
  