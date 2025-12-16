import asyncWrapper from '../middleware/asyncWrapper.js';
import { upload, getUploadConfig, uploadFiles, isCloudinaryAvailable } from '../services/cloudinaryService.js';
import { sendResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload images
// @route   POST /api/v1/upload
// @access  Private
// @desc    Upload images
// @route   POST /api/v1/upload
// @access  Private
export const uploadImages = asyncWrapper(async (req, res) => {
  // Use multer middleware with error handling
  upload(req, res, async (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File size too large. Maximum 5MB allowed.');
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return sendResponse(res, 400, false, 'Too many files. Maximum 10 files allowed.');
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return sendResponse(res, 400, false, 'Unexpected field. Please use "images" as field name.');
      }
      if (error.message.includes('Unexpected field')) {
        return sendResponse(res, 400, false, 'Unexpected field. Please use "images" as field name for file uploads.');
      }
      return sendResponse(res, 400, false, error.message);
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      // Also check for single file upload with different field name
      if (req.file) {
        req.files = [req.file];
      } else {
        return sendResponse(res, 400, false, 'No files uploaded. Please select files to upload.');
      }
    }
    
    try {
      // Check if uploadFiles function exists
      if (typeof uploadFiles !== 'function') {
        logger.error('uploadFiles function not available');
        throw new Error('Upload service not available');
      }
      
      // Process uploaded files
      const imageUrls = await uploadFiles(req.files);
      
      if (imageUrls.length === 0) {
        return sendResponse(res, 400, false, 'Failed to upload any images');
      }
      
      logger.info(`✅ Upload successful: ${imageUrls.length} images by ${req.user.email}`);
      
      return sendResponse(res, 200, true, 'Images uploaded successfully', {
        images: imageUrls,
        count: imageUrls.length,
        note: 'Files uploaded successfully. Use the returned URLs in your forms.'
      });
    } catch (err) {
      logger.error('Upload processing error:', err.message);
      return sendResponse(res, 500, false, `Failed to process upload: ${err.message}`);
    }
  });
});

// @desc    Get upload configuration for client-side upload
// @route   GET /api/v1/upload/unsigned
// @access  Private
export const getUploadConfiguration = asyncWrapper(async (req, res) => {
  const config = getUploadConfig();
  
  return sendResponse(res, 200, true, 'Upload configuration retrieved', config);
});

// @desc    Delete image
// @route   DELETE /api/v1/upload
// @access  Private
export const deleteImage = asyncWrapper(async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return sendResponse(res, 400, false, 'Image URL is required');
  }
  
  try {
    const { deleteFile } = await import('../services/cloudinaryService.js');
    const result = await deleteFile(url);
    
    if (result.result === 'ok') {
      return sendResponse(res, 200, true, 'Image deleted successfully');
    } else if (result.result === 'not_found') {
      return sendResponse(res, 404, false, 'Image not found');
    } else {
      return sendResponse(res, 400, false, 'Failed to delete image');
    }
  } catch (error) {
    logger.error('Delete image error:', error);
    return sendResponse(res, 500, false, 'Failed to delete image');
  }
});

// @desc    Serve uploaded images (for local storage)
// @route   GET /uploads/:filename
// @access  Public
export const serveUploadedImage = asyncWrapper(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'temp', filename);
  
  try {
    if (fs.existsSync(filePath)) {
      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }[ext] || 'image/jpeg';
      
      res.set('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
    } else {
      return sendResponse(res, 404, false, 'Image not found');
    }
  } catch (error) {
    logger.error('Serve image error:', error);
    return sendResponse(res, 500, false, 'Failed to serve image');
  }
});