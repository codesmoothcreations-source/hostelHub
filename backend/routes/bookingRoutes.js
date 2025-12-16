import express from 'express';
import { body, query } from 'express-validator';
import * as bookingController from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import authorizeRoles from '../middleware/roles.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Validation rules
const initiateBookingValidation = [
  body('hostelId').notEmpty().withMessage('Hostel ID is required')
];

const verifyBookingValidation = [
  body('reference').notEmpty().withMessage('Payment reference is required')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// Initiate booking (student only)
router.post(
  '/initiate',
  protect,
  authorizeRoles('student'),
  paymentLimiter,
  initiateBookingValidation,
  validateRequest,
  bookingController.initiateBooking
);

// Verify booking (public)
router.post(
  '/verify',
  paymentLimiter,
  verifyBookingValidation,
  validateRequest,
  bookingController.verifyBooking
);

// Get bookings (all authenticated users)
router.get(
  '/',
  protect,
  queryValidation,
  validateRequest,
  bookingController.getBookings
);

// Get specific booking
router.get('/:id', protect, bookingController.getBooking);

// Cancel booking
router.put('/:id/cancel', protect, bookingController.cancelBooking);

// Download receipt
router.get('/:id/receipt', protect, bookingController.downloadReceipt);

export default router;