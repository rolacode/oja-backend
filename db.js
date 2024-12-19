const mongoose = require('mongoose');

const connect1DB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://root:Rotimi0512@localhost:27044/oja?authSource=admin");

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process if the database connection fails
  }

  // Setup global connection events
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Trying to reconnect...');
  });
};

module.exports = connect1DB;
