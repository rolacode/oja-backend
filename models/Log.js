const mongoose = require('mongoose');


const logSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
    action: String,
    details: Object,
    timestamp: { type: Date, default: Date.now },
  });
  module.exports = mongoose.model('Log', logSchema);
  