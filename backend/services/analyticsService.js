import mongoose from 'mongoose';
import User from '../models/User.js';
import Hostel from '../models/Hostel.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';

// Admin overview analytics
const getAdminOverview = async () => {
  try {
    // Total counts
    const [
      totalUsers,
      totalOwners,
      totalStudents,
      totalHostels,
      totalBookings,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'student' }),
      Hostel.countDocuments(),
      Booking.countDocuments({ paymentStatus: 'success' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Revenue per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenuePerDay = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'success',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Hostel status distribution
    const hostelStatus = await Hostel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Recent bookings
    const recentBookings = await Booking.find({ paymentStatus: 'success' })
      .populate('hostel', 'name')
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Top hostels by bookings
    const topHostels = await Booking.aggregate([
      { $match: { paymentStatus: 'success' } },
      {
        $group: {
          _id: '$hostel',
          bookings: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
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
          bookings: 1,
          revenue: 1
        }
      }
    ]);
    
    return {
      success: true,
      data: {
        totals: {
          users: totalUsers,
          owners: totalOwners,
          students: totalStudents,
          hostels: totalHostels,
          bookings: totalBookings,
          revenue: totalRevenue[0]?.total || 0
        },
        charts: {
          revenuePerDay,
          hostelStatus,
          ratingDistribution
        },
        recentBookings,
        topHostels
      }
    };
    
  } catch (error) {
    logger.error('Admin analytics error:', error);
    throw error;
  }
};

// Owner overview analytics
const getOwnerOverview = async (ownerId) => {
  try {
    // Get hostels owned by this user
    const hostels = await Hostel.find({ owner: ownerId });
    const hostelIds = hostels.map(h => h._id);
    
    // Total counts
    const [
      totalHostels,
      totalBookings,
      totalRevenue
    ] = await Promise.all([
      Hostel.countDocuments({ owner: ownerId }),
      Booking.countDocuments({ 
        hostel: { $in: hostelIds },
        paymentStatus: 'success' 
      }),
      Booking.aggregate([
        { 
          $match: { 
            hostel: { $in: hostelIds },
            paymentStatus: 'success' 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Revenue per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenuePerDay = await Booking.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          paymentStatus: 'success',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Occupancy rate - UPDATED WITH 'new'
    const occupancyStats = await Hostel.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: null,
          totalInitialRooms: { $sum: '$initialRooms' },
          totalAvailableRooms: { $sum: '$availableRooms' }
        }
      }
    ]);
    
    let occupancyRate = 0;
    if (occupancyStats.length > 0 && occupancyStats[0].totalInitialRooms > 0) {
      const occupied = occupancyStats[0].totalInitialRooms - occupancyStats[0].totalAvailableRooms;
      occupancyRate = Math.round((occupied / occupancyStats[0].totalInitialRooms) * 100);
    }
    
    // Hostel performance - UPDATED WITH 'new'
    const hostelPerformance = await Hostel.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'hostel',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          rating: 1,
          availableRooms: 1,
          initialRooms: 1,
          totalBookings: { $size: { $filter: { input: '$bookings', as: 'booking', cond: { $eq: ['$$booking.paymentStatus', 'success'] } } } },
          totalRevenue: { 
            $sum: { 
              $map: {
                input: { $filter: { input: '$bookings', as: 'booking', cond: { $eq: ['$$booking.paymentStatus', 'success'] } } },
                as: 'booking',
                in: '$$booking.amount'
              }
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    // Recent bookings for owner's hostels
    const recentBookings = await Booking.find({ 
      hostel: { $in: hostelIds },
      paymentStatus: 'success'
    })
    .populate('hostel', 'name')
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);
    
    return {
      success: true,
      data: {
        totals: {
          hostels: totalHostels,
          bookings: totalBookings,
          revenue: totalRevenue[0]?.total || 0,
          occupancyRate
        },
        charts: {
          revenuePerDay
        },
        hostelPerformance,
        recentBookings
      }
    };
    
  } catch (error) {
    logger.error('Owner analytics error:', error);
    throw error;
  }
};

export {
  getAdminOverview,
  getOwnerOverview
};