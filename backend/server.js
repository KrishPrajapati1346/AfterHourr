import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import config from './config/env.js';
import { initSocket } from './config/socket.js';
import { setIO } from './services/notificationService.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
setIO(io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AfterHour API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`\n🌃 AfterHour API running on port ${PORT}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Client URL: ${config.clientUrl}\n`);
});

export default app;
