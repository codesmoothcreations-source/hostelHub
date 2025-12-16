import express from 'express';
import { body, query } from 'express-validator';
import * as hostelController from '../controllers/hostelController.js';
import { protect } from '../middleware/auth.js';
import authorizeRoles from '../middleware/roles.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Validation rules
const createHostelValidation = [
  body('name').trim().notEmpty().withMessage('Hostel name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('availableRooms').isInt({ min: 0 }).withMessage('Available rooms must be a non-negative integer'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('rentDuration').optional().isIn(['monthly', 'semester', 'yearly']).withMessage('Invalid rent duration'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

const updateHostelValidation = [
  body('name').optional().trim().notEmpty().withMessage('Hostel name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('availableRooms').optional().isInt({ min: 0 }).withMessage('Available rooms must be a non-negative integer'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('rentDuration').optional().isIn(['monthly', 'semester', 'yearly']).withMessage('Invalid rent duration'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 0, max: 1000 }).withMessage('Limit must be between 0 and 1000 (0 = no limit)'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radiusKm').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Radius must be between 0.1 and 100 km'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  query('search').optional().trim()
];

// Public routes (with authentication)
router.get('/', protect, queryValidation, validateRequest, hostelController.getHostels);
router.get('/:id', protect, hostelController.getHostel);

// Owner routes
router.post(
  '/',
  protect,
  authorizeRoles('owner', 'admin'),
  createHostelValidation,
  validateRequest,
  hostelController.createHostel
);

router.put(
  '/:id',
  protect,
  authorizeRoles('owner', 'admin'),
  updateHostelValidation,
  validateRequest,
  hostelController.updateHostel
);

router.delete('/:id', protect, authorizeRoles('owner', 'admin'), hostelController.deleteHostel);

// Owner specific routes
router.get('/owner/my-hostels', protect, authorizeRoles('owner'), hostelController.getMyHostels);

// Admin only routes
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('admin'),
  [
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ],
  validateRequest,
  hostelController.updateHostelStatus
);

export default router;