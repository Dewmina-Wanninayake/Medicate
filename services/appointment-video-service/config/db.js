const mongoose = require('mongoose');

const connectDB = async (retries = 10, delayMs = 2000) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/medicate_appointments';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed to ${mongoUri}: ${error.message}`);
    if (retries <= 0) {
      console.error('MongoDB connection retries exhausted. Exiting.');
      process.exit(1);
    }
    console.log(`Retrying MongoDB connection in ${delayMs / 1000}s... (${retries} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return connectDB(retries - 1, Math.min(delayMs * 2, 10000));
  }
};

module.exports = connectDB;
