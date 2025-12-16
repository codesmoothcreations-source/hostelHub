import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import authorizeRoles from '../middleware/roles.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin overview analytics
router.get('/overview', authorizeRoles('admin'), analyticsController.getAdminOverview);

// Owner overview analytics
router.get('/owner', authorizeRoles('owner'), analyticsController.getOwnerOverview);

// Dashboard stats for all roles
router.get('/dashboard', analyticsController.getDashboardStats);

export default router;