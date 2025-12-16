import asyncWrapper from '../middleware/asyncWrapper.js';
import * as analyticsService from '../services/analyticsService.js';
import { sendResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc    Get admin overview analytics
// @route   GET /api/v1/analytics/overview
// @access  Private/Admin
export const getAdminOverview = asyncWrapper(async (req, res) => {
  const result = await analyticsService.getAdminOverview();
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to get analytics');
  }
  
  logger.info(`Admin analytics accessed by ${req.user.email}`);
  
  return sendResponse(res, 200, true, 'Analytics retrieved', result.data);
});

// @desc    Get owner overview analytics
// @route   GET /api/v1/analytics/owner
// @access  Private/Owner
export const getOwnerOverview = asyncWrapper(async (req, res) => {
  const result = await analyticsService.getOwnerOverview(req.user._id);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to get analytics');
  }
  
  logger.info(`Owner analytics accessed by ${req.user.email}`);
  
  return sendResponse(res, 200, true, 'Analytics retrieved', result.data);
});

// @desc    Get dashboard stats (for all roles)
// @route   GET /api/v1/analytics/dashboard
// @access  Private
export const getDashboardStats = asyncWrapper(async (req, res) => {
  let data;
  
  if (req.user.role === 'admin') {
    const result = await analyticsService.getAdminOverview();
    data = result.data;
  } else if (req.user.role === 'owner') {
    const result = await analyticsService.getOwnerOverview(req.user._id);
    data = result.data;
  } else {
    // Student dashboard
    const [
      bookingCount,
      recentBookings,
      favoriteHostels
    ] = await Promise.all([
      Booking.countDocuments({ 
        student: req.user._id,
        paymentStatus: 'success' 
      }),
      Booking.find({ 
        student: req.user._id,
        paymentStatus: 'success' 
      })
      .populate('hostel', 'name images')
      .sort('-createdAt')
      .limit(5),
      Booking.aggregate([
        { 
          $match: { 
            student: req.user._id,
            paymentStatus: 'success' 
          } 
        },
        {
          $group: {
            _id: '$hostel',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: 'hostels',
            localField: '_id',
            foreignField: '_id',
            as: 'hostel'
          }
        },
        { $unwind: '$hostel' },
        {
          $project: {
            hostel: '$hostel.name',
            count: 1
          }
        }
      ])
    ]);
    
    data = {
      totals: {
        bookings: bookingCount
      },
      recentBookings,
      favoriteHostels
    };
  }
  
  return sendResponse(res, 200, true, 'Dashboard stats retrieved', data);
});