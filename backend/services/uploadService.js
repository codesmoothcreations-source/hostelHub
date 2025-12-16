import multer from 'multer';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

// Configure local storage
const uploadDir = 'uploads/temp';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

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
}).array('images', 10);

// Get uploaded file URLs
const getUploadedFileUrls = (files) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return files.map(file => {
    const filename = path.basename(file.path);
    return `${frontendUrl}/uploads/${filename}`;
  });
};

// Clean up files
const cleanupFiles = (files) => {
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

export { 
  upload, 
  getUploadedFileUrls,
  cleanupFiles
};