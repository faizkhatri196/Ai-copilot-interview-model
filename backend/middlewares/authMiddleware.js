import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/storageFallback.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot');
      
      if (isDbConnected()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch {}
      }

      if (!req.user) {
        const memUser = await memoryStore.findUserById(decoded.id);
        if (memUser) {
          req.user = { _id: memUser._id, id: memUser._id, name: memUser.name, email: memUser.email };
        } else {
          // Fallback user structure based on decoded payload to prevent session drops
          req.user = { _id: decoded.id, id: decoded.id, name: 'Candidate', email: 'candidate@example.com' };
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};
