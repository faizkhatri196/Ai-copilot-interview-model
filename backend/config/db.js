import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Attempt to use Google DNS for SRV lookups if network allows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server override skipped:', e.message);
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-interview-copilot';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Primary MongoDB connection failed: ${error.message}`);
    // Attempt local fallback if Atlas failed
    if (uri.includes('mongodb+srv://')) {
      try {
        console.log('[Database] Attempting local MongoDB fallback at mongodb://127.0.0.1:27017/ai-interview-copilot ...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/ai-interview-copilot', {
          serverSelectionTimeoutMS: 2000,
        });
        isConnected = true;
        console.log(`[Database] Connected to local fallback: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.warn(`[Database] Local fallback unavailable (${localErr.message}). Continuing in memory-buffered mode.`);
      }
    }
  }
};

export default connectDB;

