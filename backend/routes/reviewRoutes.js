import express from 'express';
import { body, query } from 'express-validator';
import * as reviewController from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import authorizeRoles from '../middleware/roles.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('hostelId').notEmpty().withMessage('Hostel ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
];

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().notEmpty().withMessage('Comment cannot be empty')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// Create review (student only)
router.post(
  '/',
  protect,
  authorizeRoles('student'),
  createReviewValidation,
  validateRequest,
  reviewController.createReview
);

// Get hostel reviews
router.get(
  '/hostel/:hostelId',
  protect,
  queryValidation,
  validateRequest,
  reviewController.getHostelReviews
);

// Update review
router.put(
  '/:id',
  protect,
  authorizeRoles('student', 'admin'),
  updateReviewValidation,
  validateRequest,
  reviewController.updateReview
);

// Delete review
router.delete(
  '/:id',
  protect,
  authorizeRoles('student', 'admin'),
  reviewController.deleteReview
);

export default router;