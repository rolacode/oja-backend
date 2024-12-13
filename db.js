const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://root:Rotimi0512@localhost:27044/oja?authSource");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected');
    });

  }
};

module.exports = connectDB;
