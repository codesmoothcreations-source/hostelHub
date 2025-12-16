import asyncWrapper from '../middleware/asyncWrapper.js';
import * as bookingService from '../services/bookingService.js';
import { sendResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc    Initiate booking
// @route   POST /api/v1/bookings/initiate
// @access  Private/Student
export const initiateBooking = asyncWrapper(async (req, res) => {
  const { hostelId } = req.body;
  
  if (!hostelId) {
    return sendResponse(res, 400, false, 'Hostel ID is required');
  }
  
  const result = await bookingService.initiateBooking(req.user._id, hostelId);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to initiate booking');
  }
  
  logger.info(`Booking initiated: ${result.booking.reference} by ${req.user.email}`);
  
  return sendResponse(res, 201, true, 'Booking initiated successfully', {
    booking: result.booking,
    paymentAuthorizationUrl: result.paymentAuthorizationUrl,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY
  });
});

// @desc    Verify booking payment
// @route   POST /api/v1/bookings/verify
// @access  Public
export const verifyBooking = asyncWrapper(async (req, res) => {
  const { reference } = req.body;
  
  if (!reference) {
    return sendResponse(res, 400, false, 'Payment reference is required');
  }
  
  const result = await bookingService.verifyBooking(reference);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Payment verification failed');
  }
  
  logger.info(`Booking verified: ${reference} - Status: ${result.booking.paymentStatus}`);
  
  return sendResponse(res, 200, true, result.message, {
    booking: result.booking,
    hostel: result.hostel
  });
});

// @desc    Get user bookings
// @route   GET /api/v1/bookings
// @access  Private
export const getBookings = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const result = await bookingService.getUserBookings(
    req.user._id,
    req.user.role,
    parseInt(page),
    parseInt(limit)
  );
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to get bookings');
  }
  
  return sendResponse(res, 200, true, 'Bookings retrieved successfully', {
    bookings: result.bookings,
    pagination: result.pagination
  });
});

// @desc    Get booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBooking = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('hostel', 'name location.address images price owner')
    .populate('student', 'name email phone');
  
  if (!booking) {
    return sendResponse(res, 404, false, 'Booking not found');
  }
  
  // Authorization check
  if (req.user.role === 'student' && booking.student._id.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Not authorized to view this booking');
  }
  
  if (req.user.role === 'owner') {
    const hostel = await Hostel.findById(booking.hostel._id);
    if (!hostel || hostel.owner.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Not authorized to view this booking');
    }
  }
  
  return sendResponse(res, 200, true, 'Booking retrieved', {
    booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncWrapper(async (req, res) => {
  const result = await bookingService.cancelBooking(
    req.params.id,
    req.user._id,
    req.user.role
  );
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to cancel booking');
  }
  
  logger.info(`Booking cancelled: ${req.params.id} by ${req.user.email}`);
  
  return sendResponse(res, 200, true, result.message, {
    booking: result.booking
  });
});

// @desc    Download booking receipt
// @route   GET /api/v1/bookings/:id/receipt
// @access  Private
export const downloadReceipt = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('hostel', 'name location.address')
    .populate('student', 'name email phone');
  
  if (!booking) {
    return sendResponse(res, 404, false, 'Booking not found');
  }
  
  // Authorization check
  if (req.user.role === 'student' && booking.student._id.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Not authorized to download this receipt');
  }
  
  if (req.user.role === 'owner') {
    const hostel = await Hostel.findById(booking.hostel._id);
    if (!hostel || hostel.owner.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Not authorized to download this receipt');
    }
  }
  
  // Generate PDF receipt
  const pdfBuffer = await generateReceipt(booking, booking.hostel, booking.student);
  
  // Set headers for PDF download
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=receipt-${booking.reference}.pdf`,
    'Content-Length': pdfBuffer.length
  });
  
  // Send PDF
  res.send(pdfBuffer);
});