// src/api/analytics.js - UPDATED
import apiClient from './apiClient';

export const analyticsAPI = {
  getAdminAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/overview');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint doesn't exist
      console.warn('Analytics endpoint not available, returning mock data');
      return {
        success: true,
        data: {
          totals: {
            users: 0,
            owners: 0,
            students: 0,
            hostels: 0,
            bookings: 0,
            revenue: 0
          }
        }
      };
    }
  },

  getOwnerAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/owner');
      return response.data;
    } catch (error) {
      console.warn('Owner analytics not available');
      return {
        success: true,
        data: {
          totals: {
            hostels: 0,
            bookings: 0,
            revenue: 0,
            occupancyRate: 0
          }
        }
      };
    }
  },

  // Remove getDashboardStats since it doesn't exist in backend
  // Use getAdminAnalytics or getOwnerAnalytics based on role
};