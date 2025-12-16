import asyncWrapper from '../middleware/asyncWrapper.js';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';
import Booking from '../models/Booking.js';
import { sendResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc    Create a review
// @route   POST /api/v1/reviews
// @access  Private/Student
export const createReview = asyncWrapper(async (req, res) => {
  const { hostelId, rating, comment } = req.body;
  
  // Validate rating
  if (rating < 1 || rating > 5) {
    return sendResponse(res, 400, false, 'Rating must be between 1 and 5');
  }
  
  // Check if hostel exists
  const hostel = await Hostel.findOne({ 
    _id: hostelId, 
    isActive: true,
    status: 'approved'
  });
  
  if (!hostel) {
    return sendResponse(res, 404, false, 'Hostel not found');
  }
  
  // Check if user has booked this hostel
  const hasBooked = await Booking.exists({
    hostel: hostelId,
    student: req.user._id,
    paymentStatus: 'success'
  });
  
  if (!hasBooked) {
    return sendResponse(res, 403, false, 'You must book this hostel before reviewing');
  }
  
  // Check if user has already reviewed this hostel
  const existingReview = await Review.findOne({
    hostel: hostelId,
    user: req.user._id
  });
  
  if (existingReview) {
    return sendResponse(res, 400, false, 'You have already reviewed this hostel');
  }
  
  // Create review
  const review = await Review.create({
    hostel: hostelId,
    user: req.user._id,
    rating: parseInt(rating),
    comment
  });
  
  // Populate user details
  await review.populate('user', 'name avatar');
  
  // Update hostel rating (handled by middleware)
  
  logger.info(`Review created for hostel ${hostel.name} by ${req.user.email}`);
  
  return sendResponse(res, 201, true, 'Review created successfully', {
    review
  });
});

// @desc    Get hostel reviews
// @route   GET /api/v1/reviews/hostel/:hostelId
// @access  Private
export const getHostelReviews = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  // Check if hostel exists
  const hostel = await Hostel.findOne({ 
    _id: req.params.hostelId, 
    isActive: true 
  });
  
  if (!hostel) {
    return sendResponse(res, 404, false, 'Hostel not found');
  }
  
  const reviews = await Review.find({ hostel: req.params.hostelId })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Review.countDocuments({ hostel: req.params.hostelId });
  
  return sendResponse(res, 200, true, 'Reviews retrieved', {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Student
export const updateReview = asyncWrapper(async (req, res) => {
  const { rating, comment } = req.body;
  
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return sendResponse(res, 404, false, 'Review not found');
  }
  
  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Not authorized to update this review');
  }
  
  // Update review
  if (rating !== undefined) review.rating = parseInt(rating);
  if (comment !== undefined) review.comment = comment;
  
  await review.save();
  
  logger.info(`Review updated: ${review._id} by ${req.user.email}`);
  
  return sendResponse(res, 200, true, 'Review updated successfully', {
    review
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Student or Admin
export const deleteReview = asyncWrapper(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return sendResponse(res, 404, false, 'Review not found');
  }
  
  // Check ownership or admin access
  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Not authorized to delete this review');
  }
  
  // Store hostel ID before deleting
  const hostelId = review.hostel;
  
  await review.deleteOne();
  
  // Update hostel rating
  await Hostel.updateRating(hostelId);
  
  logger.info(`Review deleted: ${review._id} by ${req.user.email}`);
  
  return sendResponse(res, 200, true, 'Review deleted successfully');
});