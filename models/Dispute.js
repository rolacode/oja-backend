const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    description: String,
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    resolution: String,
  });
  module.exports = mongoose.model('Dispute', disputeSchema);
  