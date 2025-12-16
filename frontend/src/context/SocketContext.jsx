// src/context/SocketContext.jsx - FIXED VERSION
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !user || socketRef.current) return;

    console.log('Connecting to Socket.IO with token:', token.substring(0, 20) + '...');

    const socketInstance = io('http://localhost:5000', {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setIsConnected(true);
      
      // Join user's room
      if (user?._id) {
        socketInstance.emit('join', user._id);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      toast.error('Connection to chat failed');
    });

    socketInstance.on('user_online', (userId) => {
      console.log('User online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socketInstance.on('user_offline', (userId) => {
      console.log('User offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketInstance.on('new_message', (message) => {
      console.log('New message received:', message);
      toast(`New message from ${message.from?.name || 'Unknown'}`, {
        icon: '💬',
      });
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user]);

  const sendMessage = (to, content) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to chat');
      return false;
    }

    console.log('Sending message to:', to);
    socket.emit('send_message', {
      to,
      content,
      from: user._id
    });
    return true;
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};