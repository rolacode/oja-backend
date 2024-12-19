const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
    text: String,
    timestamp: { type: Date, default: Date.now },
  });
  module.exports = mongoose.model('Message', messageSchema);
  