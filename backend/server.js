import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './utils/logger.js';
import * as messageService from './services/messageService.js';
// import path from 'path';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store online users
const userSockets = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach userId to socket
    socket.userId = decoded.id;
    next();
  } catch (err) {
    logger.error('Socket authentication error:', err.message);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.userId;
  
  if (!userId) {
    logger.warn('Socket connected without userId');
    socket.disconnect();
    return;
  }
  
  logger.info(`Socket connected: ${socket.id} for user: ${userId}`);
  
  // Track user's sockets
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket.id);
  
  // Join user's personal room
  socket.join(`user_${userId}`);
  
  // Broadcast user online status to others
  socket.broadcast.emit('user_online', { userId });
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { to, content } = data;
      
      // Validate data
      if (!to || !content) {
        socket.emit('error', { message: 'Recipient and content required' });
        return;
      }
      
      logger.info(`Message from ${userId} to ${to}: ${content.substring(0, 50)}...`);
      
      // Save message to database
      const message = await messageService.createMessage(userId, to, content);
      
      if (message.success) {
        // Emit to recipient if online
        io.to(`user_${to}`).emit('new_message', message.data.message);
        
        // Send confirmation to sender
        socket.emit('message_sent', message.data.message);
      } else {
        socket.emit('error', { message: 'Failed to send message' });
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { to, isTyping } = data;
    
    if (to) {
      io.to(`user_${to}`).emit('user_typing', {
        from: userId,
        isTyping
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id} for user: ${userId}`);
    
    if (userId) {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        
        // If user has no more sockets, broadcast offline status
        if (sockets.size === 0) {
          userSockets.delete(userId);
          socket.broadcast.emit('user_offline', { userId });
        }
      }
    }
  });
  
  // Handle errors
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5001;

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  logger.info(`API: http://localhost:${PORT}/api/v1`);
  logger.info(`WebSocket: ws://localhost:${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/health`);
  logger.info(`Docs: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  // Disconnect all sockets
  io.disconnectSockets(true);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connection
    try {
      await mongoose.connection.close();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error('Error closing database connection:', err);
    }
    
    logger.info('Shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});