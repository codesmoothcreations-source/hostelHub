// scripts/test-upload.js
import axios from 'axios';
import FormData from 'form-data';

const testUpload = async () => {
  try {
    // First, login to get token
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@hostelhub.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.accessToken;
    
    // Create a test image (simple base64 image)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Create form data
    const formData = new FormData();
    formData.append('images', testImage, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    // Make upload request
    const uploadRes = await axios.post('http://localhost:5000/api/v1/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(uploadRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error('Error:', error.response?.data || error.message);
  }
};

testUpload();

// test-upload.js
// import { upload, uploadFiles, isCloudinaryAvailable } from './services/cloudinaryService.js';

// console.log('Testing Cloudinary Service...');
// console.log('1. upload function exists:', typeof upload === 'function');
// console.log('2. uploadFiles function exists:', typeof uploadFiles === 'function');
// console.log('3. isCloudinaryAvailable function exists:', typeof isCloudinaryAvailable === 'function');
// console.log('4. Cloudinary available:', isCloudinaryAvailable());

// if (typeof uploadFiles !== 'function') {
//   console.error('❌ ERROR: uploadFiles is not exported properly!');
//   console.log('Checking exports from cloudinaryService.js...');
  
//   // Try to import everything
//   import * as cloudinaryService from './services/cloudinaryService.js';
//   console.log('Available exports:', Object.keys(cloudinaryService));
// }