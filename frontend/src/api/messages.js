// src/api/messages.js
import apiClient from './apiClient';

export const messagesAPI = {
  sendMessage: async (data) => {
    const response = await apiClient.post('/messages', data);
    return response.data;
  },

  getConversation: async (userId, params = {}) => {
    const response = await apiClient.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/messages/unread');
    return response.data;
  },

  getConversations: async () => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  }
};