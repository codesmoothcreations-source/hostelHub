// 

import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import authorizeRoles from '../middleware/roles.js';
import validateRequest from '../middleware/validateRequest.js';

// Initialize the Express router
const router = express.Router();

// ------------------------------------------------------------------------
// SECTION 1: Middleware for all routes in this file
// All routes defined below require a valid JWT token to ensure the user is logged in.
// ------------------------------------------------------------------------
router.use(protect);

// ------------------------------------------------------------------------
// SECTION 2: General User Routes (Accessible by any logged-in user)
// These routes operate on the profile of the currently logged-in user.
// ------------------------------------------------------------------------

// GET /api/v1/users/me
// Endpoint to retrieve the profile data of the logged-in user.
router.get('/me', userController.getMe);

// PUT /api/v1/users/me
// Endpoint to update the profile data of the logged-in user.
router.put(
  '/me',
  // Input Validation: Checks data meets format requirements
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
    // Fix applied here: Ensures the avatar field, if provided, is a valid URL string.
    body('avatar').optional().isURL().withMessage('Please provide a valid URL'), 
    body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('address').optional().trim()
  ],
  validateRequest, // Middleware to stop the request if any validation rule fails
  userController.updateProfile
);

// PUT /api/v1/users/change-password
// Endpoint for a logged-in user to securely change their password.
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validateRequest,
  userController.changePassword
);

// ------------------------------------------------------------------------
// SECTION 3: Admin-Only Routes (Management/Dashboard)
// These routes are protected by the 'admin' role middleware.
// ------------------------------------------------------------------------

// GET /api/v1/users
// 🚨 FIX FOR 404 ERROR 🚨
// This route fetches a list of ALL users, typically for the admin dashboard.
// It uses the path '/' which resolves to the base route /api/v1/users.
router.get(
    '/', 
    authorizeRoles('admin'), // Ensures only users with 'admin' role can access
    userController.getUsers // Controller to handle fetching and filtering of the user list
);

// GET /api/v1/users/:id
// Endpoint to get a single user's details by their ID.
router.get('/:id', authorizeRoles('admin'), userController.getUserById);

// PUT /api/v1/users/:id
// Endpoint to update a user's details (e.g., change role) by their ID.
router.put('/:id', authorizeRoles('admin'), userController.updateUser);

// DELETE /api/v1/users/:id
// Endpoint to delete a user by their ID.
router.delete('/:id', authorizeRoles('admin'), userController.deleteUser);

export default router;