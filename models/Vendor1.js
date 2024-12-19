const mongoose = require('mongoose');


const vendor1Schema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  nin: { type: String, required: true},
}, {
  timestamps: true
});

vendor1Schema.index({ location: '2dsphere' });

module.exports = mongoose.model('Vendor1', vendor1Schema);

