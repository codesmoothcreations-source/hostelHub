// src/api/hostels.js - FINAL WORKING VERSION
import apiClient from './apiClient';

export const hostelsAPI = {
  
  createHostel: async (data) => {
    try {
      console.log('API: Creating hostel with data:', data);
      
      // Validate required fields
      const requiredFields = ['name', 'description', 'price', 'lat', 'lng', 'address', 'availableRooms'];
      const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate images are valid URLs
      if (data.images && Array.isArray(data.images)) {
        const invalidImages = data.images.filter(url => {
          try {
            new URL(url);
            return !url.startsWith('http');
          } catch {
            return true;
          }
        });

        if (invalidImages.length > 0) {
          console.error('Invalid image URLs:', invalidImages);
          throw new Error(`Invalid image URLs found. Please re-upload images.`);
        }
      }

      // Prepare the request data exactly as backend expects
      const requestData = {
        name: String(data.name).trim(),
        description: String(data.description).trim(),
        price: Number(data.price),
        lat: Number(data.lat),
        lng: Number(data.lng),
        address: String(data.address).trim(),
        availableRooms: Number(data.availableRooms),
        rentDuration: data.rentDuration || 'monthly',
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        images: Array.isArray(data.images) ? data.images : []
      };

      console.log('API: Sending request data:', requestData);

      const response = await apiClient.post('/hostels', requestData);
      
      console.log('API: Response received:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Hostel creation failed');
      }

      return response.data;

    } catch (error) {
      console.error('API Error in createHostel:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Provide user-friendly error messages
      let userMessage = error.message;
      
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors && Array.isArray(errors)) {
          userMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');
        } else {
          userMessage = 'Validation failed. Please check your inputs.';
        }
      } else if (error.response?.status === 401) {
        userMessage = 'Session expired. Please login again.';
      } else if (error.response?.status === 500) {
        userMessage = 'Server error. Please try again later.';
      }

      throw new Error(userMessage);
    }
  },

  // Other methods remain the same...
  getHostels: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });

    const response = await apiClient.get('/hostels', { params: cleanParams });
    return response.data;
  },

  getHostel: async (id) => {
    const response = await apiClient.get(`/hostels/${id}`);
    return response.data;
  },

  updateHostel: async (id, data) => {
    const response = await apiClient.put(`/hostels/${id}`, data);
    return response.data;
  },

  deleteHostel: async (id) => {
    const response = await apiClient.delete(`/hostels/${id}`);
    return response.data;
  }
};