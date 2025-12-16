// src/api/reviews.js
import apiClient from './apiClient';

export const reviewsAPI = {
  createReview: async (data) => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  getHostelReviews: async (hostelId, params = {}) => {
    const response = await apiClient.get(`/reviews/hostel/${hostelId}`, { params });
    return response.data;
  }
};