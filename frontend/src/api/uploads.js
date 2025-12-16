// src/api/uploads.js - COMPLETE WORKING VERSION
import apiClient from './apiClient';

export const uploadsAPI = {
  /**
   * Upload images to backend (preferred method)
   * Backend should handle Cloudinary upload
   */
  uploadToBackend: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Uploading', files.length, 'files to backend...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type, let browser set it with boundary
        },
        body: formData
      });

      const data = await response.json();
      console.log('Backend upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Return image URLs from backend response
      const imageUrls = data.data?.images || [];
      console.log('Uploaded image URLs:', imageUrls);
      return imageUrls;

    } catch (error) {
      console.error('Backend upload error:', error);
      throw error;
    }
  },

  /**
   * Direct Cloudinary upload (fallback method)
   * Uses unsigned upload preset
   */
  uploadToCloudinaryDirect: async (file) => {
    try {
      // Cloudinary configuration
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload';
      
      console.log('Uploading to Cloudinary:', { cloudName, uploadPreset });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Cloudinary upload success:', data.secure_url);
      return data.secure_url;

    } catch (error) {
      console.error('Cloudinary direct upload error:', error);
      throw error;
    }
  },

  /**
   * Get upload configuration from backend
   */
  getUploadConfig: async () => {
    try {
      const response = await apiClient.get('/upload/unsigned');
      return response.data;
    } catch (error) {
      console.warn('Failed to get upload config from backend:', error);
      // Return default config
      return {
        success: true,
        data: {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
          apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload',
          folder: 'hostelhub'
        }
      };
    }
  }
};