import { Server } from 'socket.io';
import config from './env.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join role-based rooms
    socket.on('join:role', (role) => {
      socket.join(`role:${role}`);
      console.log(`  → ${socket.id} joined room: role:${role}`);
    });

    // Join user-specific room
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`  → ${socket.id} joined room: user:${userId}`);
    });

    // Driver location updates
    socket.on('driver:location', (data) => {
      io.to('role:ngo').to('role:donor').emit('driver:moved', data);
    });

    // Donation status updates
    socket.on('donation:statusChange', (data) => {
      io.to(`user:${data.donorId}`).emit('donation:updated', data);
      if (data.ngoId) {
        io.to(`user:${data.ngoId}`).emit('donation:updated', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
