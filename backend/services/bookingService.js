import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Hostel from '../models/Hostel.js';
import User from '../models/User.js';
import * as paystackService from './paystackService.js';
import logger from '../utils/logger.js';

// Initiate booking
const initiateBooking = async (studentId, hostelId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if hostel exists and has available rooms
    const hostel = await Hostel.findOne({ 
      _id: hostelId,
      status: 'approved',
      isActive: true,
      availableRooms: { $gte: 1 }
    }).session(session);
    
    if (!hostel) {
      throw new Error('Hostel not found or no rooms available');
    }
    
    // Check if student exists
    const student = await User.findById(studentId).session(session);
    if (!student || student.role !== 'student') {
      throw new Error('Invalid student');
    }
    
    // Generate unique reference
    const reference = Booking.generateReference();
    
    // Create booking
    const booking = await Booking.create([{
      hostel: hostelId,
      student: studentId,
      amount: hostel.price,
      currency: hostel.currency,
      reference,
      paymentStatus: 'pending',
      duration: hostel.rentDuration
    }], { session });
    
    // Initialize payment with Paystack
    const paymentResult = await paystackService.initializePayment({
      email: student.email,
      amount: hostel.price,
      reference,
      metadata: {
        bookingId: booking[0]._id.toString(),
        studentId: studentId.toString(),
        hostelId: hostelId.toString(),
        hostelName: hostel.name
      }
    });
    
    if (!paymentResult.success) {
      throw new Error(`Payment initialization failed: ${paymentResult.message}`);
    }
    
    // Update booking with Paystack reference
    booking[0].paystackReference = paymentResult.data.reference;
    await booking[0].save({ session });
    
    await session.commitTransaction();
    
    return {
      success: true,
      booking: booking[0],
      paymentAuthorizationUrl: paymentResult.data.authorization_url,
      paymentReference: paymentResult.data.reference
    };
    
  } catch (error) {
    await session.abortTransaction();
    logger.error('Booking initiation error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Verify booking (idempotent)
const verifyBooking = async (reference) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find booking
    const booking = await Booking.findOne({ reference }).session(session);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // If already successful, return booking (idempotency)
    if (booking.paymentStatus === 'success') {
      await session.commitTransaction();
      return {
        success: true,
        booking,
        message: 'Booking already verified'
      };
    }
    
    // Verify with Paystack
    const paymentResult = await paystackService.verifyTransaction(reference);
    
    if (!paymentResult.verified) {
      // Update booking as failed
      booking.paymentStatus = 'failed';
      booking.paymentMeta = paymentResult.data || {};
      await booking.save({ session });
      
      await session.commitTransaction();
      
      return {
        success: false,
        booking,
        message: paymentResult.message || 'Payment verification failed'
      };
    }
    
    // Update booking as processing
    booking.paymentStatus = 'processing';
    booking.paymentMeta = paymentResult.data;
    booking.paystackReference = paymentResult.data.reference;
    await booking.save({ session });
    
    // Atomically decrement available rooms
    const hostelUpdate = await Hostel.findOneAndUpdate(
      { 
        _id: booking.hostel, 
        availableRooms: { $gte: 1 },
        status: 'approved',
        isActive: true
      },
      { 
        $inc: { availableRooms: -1 },
        $set: { updatedAt: new Date() }
      },
      { 
        new: true,
        session,
        runValidators: true
      }
    );
    
    if (!hostelUpdate) {
      throw new Error('No rooms available or hostel not approved');
    }
    
    // Update booking as successful
    booking.paymentStatus = 'success';
    await booking.save({ session });
    
    await session.commitTransaction();
    
    logger.info(`Booking ${booking._id} verified successfully. Hostel ${booking.hostel} rooms updated.`);
    
    return {
      success: true,
      booking,
      hostel: hostelUpdate,
      message: 'Booking verified successfully'
    };
    
  } catch (error) {
    await session.abortTransaction();
    
    // Update booking as failed if it exists
    if (await Booking.exists({ reference })) {
      await Booking.findOneAndUpdate(
        { reference },
        { 
          paymentStatus: 'failed',
          paymentMeta: { error: error.message }
        }
      );
    }
    
    logger.error('Booking verification error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Get user bookings
const getUserBookings = async (userId, userRole, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (userRole === 'student') {
      query.student = userId;
    } else if (userRole === 'owner') {
      // Get hostels owned by this user
      const hostels = await Hostel.find({ owner: userId }).select('_id');
      const hostelIds = hostels.map(h => h._id);
      query.hostel = { $in: hostelIds };
    }
    // Admin can see all bookings
    
    const bookings = await Booking.find(query)
      .populate('hostel', 'name location.address images price')
      .populate('student', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Booking.countDocuments(query);
    
    return {
      success: true,
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    logger.error('Get bookings error:', error);
    throw error;
  }
};

// Cancel booking
const cancelBooking = async (bookingId, userId, userRole) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const booking = await Booking.findOne({ _id: bookingId }).session(session);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Authorization checks
    if (userRole === 'student' && booking.student.toString() !== userId.toString()) {
      throw new Error('Not authorized to cancel this booking');
    }
    
    if (userRole === 'owner') {
      const hostel = await Hostel.findOne({ _id: booking.hostel, owner: userId }).session(session);
      if (!hostel) {
        throw new Error('Not authorized to cancel this booking');
      }
    }
    
    // Can only cancel pending or processing bookings
    if (!['pending', 'processing'].includes(booking.paymentStatus)) {
      throw new Error(`Cannot cancel booking with status: ${booking.paymentStatus}`);
    }
    
    // Update booking status
    booking.paymentStatus = 'cancelled';
    await booking.save({ session });
    
    // If payment was successful, increment available rooms
    if (booking.paymentStatus === 'success') {
      await Hostel.findOneAndUpdate(
        { _id: booking.hostel },
        { $inc: { availableRooms: 1 } },
        { session }
      );
    }
    
    await session.commitTransaction();
    
    return {
      success: true,
      booking,
      message: 'Booking cancelled successfully'
    };
    
  } catch (error) {
    await session.abortTransaction();
    logger.error('Cancel booking error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export {
  initiateBooking,
  verifyBooking,
  getUserBookings,
  cancelBooking
};