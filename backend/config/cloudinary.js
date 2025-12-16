import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config()

// This function checks if Cloudinary is properly configured
const configureCloudinary = () => {
  // Log for debugging
  console.log('🔍 Checking Cloudinary configuration...');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set ✓' : 'Missing ✗');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗');
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  // Check if all three required values are present
  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    logger.warn(`Cloudinary configuration incomplete. Missing: ${missing.join(', ')}`);
    logger.info('Uploads will use local storage as fallback');
    return null;
  }
  
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    
    logger.info('✅ Cloudinary configured successfully');
    return cloudinary;
  } catch (error) {
    logger.error('❌ Cloudinary configuration failed:', error.message);
    logger.info('Uploads will use local storage as fallback');
    return null;
  }
};

// Export the configured instance
const cloudinaryInstance = configureCloudinary();
export default cloudinaryInstance;