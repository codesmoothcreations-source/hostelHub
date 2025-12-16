import express from 'express';
import { body } from 'express-validator';
import * as uploadController from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload images
router.post('/', uploadController.uploadImages);

// Get upload configuration for client-side upload
router.get('/unsigned', uploadController.getUploadConfiguration);

// Delete image
router.delete(
  '/',
  [
    body('publicId').notEmpty().withMessage('Public ID is required')
  ],
  validateRequest,
  uploadController.deleteImage
);

export default router;