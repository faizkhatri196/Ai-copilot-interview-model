import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable Mongoose command buffering so queries fail immediately or switch to fallback
// instead of hanging for 10,000ms when disconnected.
mongoose.set('bufferCommands', false);

let isConnected = false;

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

const connectDB = async () => {
  if (isConnected || isDbConnected()) return;
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[Database] MONGODB_URI not configured. Operating in high-speed fallback memory storage mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Remote MongoDB unreachable (${error.message}). High-speed persistent fallback active.`);
  }
};

export default connectDB;
