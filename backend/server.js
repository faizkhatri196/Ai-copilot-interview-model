import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { initializeSocket } from './socket/interviewSocket.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Performance Monitoring
const serverStartTime = Date.now();
let totalRequestsHandled = 0;

app.use((req, res, next) => {
  totalRequestsHandled++;
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 2000) {
      console.warn(`[Slow Request] ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AI Interview Intelligence',
    version: '2.0.0-ultra-elite',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/metrics', (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    totalRequestsHandled,
    memory: {
      rssMb: Math.round(memory.rss / 1024 / 1024),
      heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    },
    activeSockets: io.engine.clientsCount || 0,
    timestamp: new Date().toISOString()
  });
});

// Mount Domain Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io initialization
initializeSocket(io);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Interview Intelligence Platform API running in Ultra-Elite mode',
    status: 'ONLINE'
  });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] AI Interview Intelligence running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export { app, server };
