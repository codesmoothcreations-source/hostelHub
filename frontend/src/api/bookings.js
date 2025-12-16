// src/api/bookings.js
import apiClient from './apiClient';

export const bookingsAPI = {
  initiateBooking: async (hostelId) => {
    const response = await apiClient.post('/bookings/initiate', { hostelId });
    return response.data;
  },

  verifyBooking: async (reference) => {
    const response = await apiClient.post('/bookings/verify', { reference });
    return response.data;
  },

  getBookings: async (params = {}) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  getBooking: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await apiClient.put(`/bookings/${id}/cancel`);
    return response.data;
  }
};