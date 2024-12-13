const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
});

buyerSchema.index({ location: '2dsphere' }); // Enable geospatial queries

module.exports = mongoose.model('Buyer', buyerSchema);
