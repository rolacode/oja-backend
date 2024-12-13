const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  priceRange: { type: String, enum: ['low', 'medium', 'high'] },
});
locationSchema.index({ coordinates: '2dsphere' });//Enable geospatial queries 

module.exports = mongoose.model('Location', locationSchema);

