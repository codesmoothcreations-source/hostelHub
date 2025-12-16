import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

// Check if Cloudinary is available
const isCloudinaryAvailable = () => {
  return cloudinary !== null;
};

// Create uploads directory for local storage
const uploadDir = 'uploads/temp';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}

// Configure multer for local storage (always works)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();

    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

// Create multer instance
const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed'));
    }
  }
}).array('images', 10); // Max 10 images

// Upload files - tries Cloudinary first, falls back to local
const uploadFiles = async (files) => {
  const uploadedUrls = [];

  for (const file of files) {
    try {
      // Try Cloudinary first if available
      if (isCloudinaryAvailable()) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'hostelhub',
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 750, crop: 'limit' }
          ]
        });

        uploadedUrls.push(result.secure_url);
        logger.info(`Uploaded to Cloudinary: ${result.public_id}`);

        // Clean up local file after successful Cloudinary upload
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } else {
        // Fallback to local storage
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const filename = path.basename(file.path);
        uploadedUrls.push(`${frontendUrl}/uploads/${filename}`);
        logger.info(`Stored locally: ${filename}`);
      }
    } catch (error) {
      // --- 🛑 IMPORTANT CHANGE HERE 🛑 ---
      // Log the ENTIRE error object to see Cloudinary's response
      logger.error(`❌ Cloudinary Upload Failed for ${file.originalname}:`, error);

      // Fallback to local storage on error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const filename = path.basename(file.path);
      uploadedUrls.push(`${frontendUrl}/uploads/${filename}`);
      logger.info(`Fallback to local storage: ${filename}`);
    }
  }

  return uploadedUrls;
};

// Get upload configuration
const getUploadConfig = () => {
  if (isCloudinaryAvailable()) {
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'hostelhub_unsigned',
      folder: 'hostelhub',
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
      enabled: true
    };
  }

  return {
    localUpload: true,
    endpoint: '/api/v1/upload',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    enabled: true
  };
};

// Delete file
const deleteFile = async (urlOrFilename) => {
  if (isCloudinaryAvailable() && urlOrFilename.includes('cloudinary.com')) {
    try {
      // Extract public_id from Cloudinary URL
      const parts = urlOrFilename.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `hostelhub/${filename.split('.')[0]}`;

      const result = await cloudinary.uploader.destroy(publicId);
      logger.info(`Deleted from Cloudinary: ${publicId}`);
      return result;
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete from Cloudinary');
    }
  } else {
    // Delete local file
    const filename = path.basename(urlOrFilename);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted local file: ${filename}`);
      return { result: 'ok' };
    }

    logger.warn(`File not found: ${filename}`);
    return { result: 'not_found' };
  }
};

export {
  upload,
  uploadFiles,
  getUploadConfig,
  deleteFile,
  isCloudinaryAvailable
};