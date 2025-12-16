import axios from 'axios';
import logger from '../utils/logger.js';
import dotenv from "dotenv";

dotenv.config()

// Check if Paystack is properly configured
const isPaystackConfigured = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  // Check if key exists and is not the default placeholder
  if (!secretKey || secretKey === 'sk_test_xxx' || secretKey.startsWith('sk_test_placeholder')) {
    return false;
  }
  
  // Check if it looks like a valid Paystack key
  return secretKey.startsWith('sk_');
};

let paystack;

if (isPaystackConfigured()) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000
  });
  
  // Test the connection
  paystack.get('/transaction')
    .then(() => {
      logger.info('✅ Paystack configuration successful');
    })
    .catch(error => {
      logger.error('❌ Paystack connection test failed:', error.message);
      logger.warn('Payment functionality may not work properly');
    });
} else {
  logger.warn('⚠️ Paystack not configured. Using mock payments for development.');
  logger.info('To enable real payments, add PAYSTACK_SECRET_KEY to .env file');
  
  // Create a mock paystack instance
  paystack = {
    post: async (url, data) => {
      logger.info(`📤 Mock Paystack API: POST ${url}`);
      
      if (url === '/transaction/initialize') {
        return {
          data: {
            status: true,
            message: 'Mock payment initialized',
            data: {
              authorization_url: 'http://localhost:3000/mock-payment',
              reference: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              access_code: 'mock_access_code'
            }
          }
        };
      }
      
      return { 
        data: { 
          status: false, 
          message: 'Paystack not configured',
          data: null 
        } 
      };
    },
    
    get: async (url) => {
      logger.info(`📤 Mock Paystack API: GET ${url}`);
      
      if (url.includes('/transaction/verify/')) {
        const reference = url.split('/').pop();
        return {
          data: {
            status: true,
            message: 'Mock verification successful',
            data: {
              status: 'success',
              reference: reference,
              amount: 100000,
              currency: 'GHS',
              gateway_response: 'Mock payment successful',
              paid_at: new Date().toISOString()
            }
          }
        };
      }
      
      return { 
        data: { 
          status: false, 
          message: 'Paystack not configured',
          data: null 
        } 
      };
    }
  };
}

export default paystack;