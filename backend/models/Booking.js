import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Please provide a hostel']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a student']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: process.env.CURRENCY_CODE || 'GHS'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  reference: {
    type: String,
    required: [true, 'Please provide a payment reference'],
    unique: true,
    index: true
  },
  paystackReference: {
    type: String,
    index: true
  },
  paymentMeta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  checkInDate: {
    type: Date,
    default: Date.now
  },
  checkOutDate: Date,
  duration: {
    type: String,
    enum: ['monthly', 'semester', 'yearly'],
    default: 'monthly'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
bookingSchema.index({ student: 1, createdAt: -1 });
bookingSchema.index({ hostel: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ reference: 1 }, { unique: true });

// Virtual populate
bookingSchema.virtual('hostelDetails', {
  ref: 'Hostel',
  localField: 'hostel',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('studentDetails', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

// Update timestamp on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate reference
bookingSchema.statics.generateReference = function() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HHL-${timestamp}-${random}`;
};

// Static method to check if booking is successful
bookingSchema.methods.isSuccessful = function() {
  return this.paymentStatus === 'success';
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;