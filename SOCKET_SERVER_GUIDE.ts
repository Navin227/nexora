/**
 * Simple Socket.io Server Setup Guide
 * 
 * To use the WebSocket chat functionality, you need to set up a Socket.io server.
 * This is a basic example of what the server should look like.
 * 
 * Install dependencies:
 * npm install express socket.io cors
 * 
 * Server Code (server.js):
 */

// Example server setup (Node.js with Express and Socket.io)
/*
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  // Track online users
  socket.on('user:online', (data) => {
    connectedUsers[socket.id] = data.userId;
    io.emit('user:online', { userId: data.userId, socketId: socket.id });
  });

  // Channel messaging
  socket.on('message:send', (data) => {
    io.to(data.channelId).emit('message:receive', data);
  });

  // Join channel room
  socket.on('channel:join', (channelId) => {
    socket.join(channelId);
  });

  // Leave channel room
  socket.on('channel:leave', (channelId) => {
    socket.leave(channelId);
  });

  // Direct messaging
  socket.on('dm:send', (data) => {
    const recipientSocket = Object.entries(connectedUsers).find(
      ([_, userId]) => userId === data.recipientId
    );
    if (recipientSocket) {
      io.to(recipientSocket[0]).emit('dm:receive', data);
    }
  });

  // Typing indicator
  socket.on('typing:start', (data) => {
    io.to(data.channelId).emit('typing:start', { 
      userId: connectedUsers[socket.id], 
      channelId: data.channelId 
    });
  });

  socket.on('typing:stop', (data) => {
    io.to(data.channelId).emit('typing:stop', { 
      userId: connectedUsers[socket.id],
      channelId: data.channelId 
    });
  });

  // User disconnect
  socket.on('disconnect', () => {
    const userId = connectedUsers[socket.id];
    delete connectedUsers[socket.id];
    io.emit('user:offline', { userId });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
*/

/**
 * FRONTEND USAGE:
 * 
 * The socket service in services/socketService.ts handles all WebSocket communication.
 * 
 * Usage in components:
 * 
 * import { socketService } from './services/socketService';
 * 
 * // Initialize on app load
 * await socketService.connect('http://localhost:3001');
 * 
 * // Listen for messages
 * socketService.on('message:receive', (data) => {
 *   console.log('New message:', data);
 * });
 * 
 * // Send a message
 * socketService.emit('message:send', {
 *   channelId: 'channel-123',
 *   message: { id: '1', content: 'Hello', senderId: 'user-1', ... }
 * });
 * 
 * // Join a channel
 * socketService.emit('channel:join', 'channel-123');
 * 
 * // Send DM
 * socketService.emit('dm:send', {
 *   recipientId: 'user-2',
 *   message: { ... }
 * });
 */

export const socketServerGuide = {};
