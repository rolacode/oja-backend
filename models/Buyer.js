const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true},
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
}, {
  timestamps: true
});

buyerSchema.index({ location: '2dsphere' }); // Enable geospatial queries

module.exports = mongoose.model('Buyer', buyerSchema);
