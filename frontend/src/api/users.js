// src/api/users.js
import apiClient from './apiClient';

export const usersAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.put('/users/change-password', data);
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};