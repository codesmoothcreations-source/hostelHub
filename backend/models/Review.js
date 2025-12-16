import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Please provide a hostel']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters'],
    trim: true
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
  timestamps: true
});

// Compound index to ensure one review per user per hostel
reviewSchema.index({ hostel: 1, user: 1 }, { unique: true });

// Index for sorting and filtering
reviewSchema.index({ hostel: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update hostel rating after save
  if (this.isNew || this.isModified('rating')) {
    const Hostel = mongoose.model('Hostel');
    setTimeout(async () => {
      try {
        await Hostel.updateRating(this.hostel);
      } catch (error) {
        console.error('Error updating hostel rating:', error);
      }
    }, 0);
  }
  
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;