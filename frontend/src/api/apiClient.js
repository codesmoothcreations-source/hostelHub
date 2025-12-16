// src/api/apiClient.js - IMPROVED ERROR HANDLING
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Log error for debugging
    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      })
      .catch(err => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.error('No refresh token found');
    localStorage.clear();
    window.location.href = '/login';
    return Promise.reject(error);
  }

  try {
    console.log('Attempting token refresh...');
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    }, {
      // Don't use the interceptor for this request
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Token refresh response:', response.data);
    
    if (!response.data.success) {
      throw new Error('Token refresh failed');
    }

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    
    // Store new tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Update axios default header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    // Process queued requests
    processQueue(null, accessToken);
    isRefreshing = false;

    // Retry original request
    return apiClient(originalRequest);
    
  } catch (refreshError) {
    console.error('Token refresh error:', refreshError);
    processQueue(refreshError, null);
    isRefreshing = false;
    
    // Clear tokens and redirect to login
    localStorage.clear();
    window.location.href = '/login';
    
    return Promise.reject(refreshError);
  }
}

    // Handle specific errors
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error('Validation failed. Please check your inputs.');
      }
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;