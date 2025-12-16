import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an owner']
  },
  name: {
    type: String,
    required: [true, 'Please provide a hostel name'],
    trim: true,
    maxlength: [100, 'Hostel name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: process.env.CURRENCY_CODE || 'GHS'
  },
  rentDuration: {
    type: String,
    enum: ['monthly', 'semester', 'yearly'],
    default: 'monthly'
  },
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        return url.match(/^https?:\/\/.+/);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please provide coordinates [lng, lat]'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates. Provide [longitude, latitude]'
      }
    },
    address: {
      type: String,
      required: [true, 'Please provide an address']
    }
  },
  availableRooms: {
    type: Number,
    required: [true, 'Please provide number of available rooms'],
    min: [0, 'Available rooms cannot be negative'],
    default: 0
  },
  initialRooms: {
    type: Number,
    required: [true, 'Please provide initial number of rooms'],
    min: [0, 'Initial rooms cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  numberOfRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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

// Index for geospatial queries
hostelSchema.index({ location: '2dsphere' });

// Index for text search
hostelSchema.index({ name: 'text', description: 'text', 'location.address': 'text' });

// Index for common queries
hostelSchema.index({ status: 1, price: 1, rating: -1 });
hostelSchema.index({ owner: 1, status: 1 });

// Virtual for occupancy rate
hostelSchema.virtual('occupancyRate').get(function() {
  if (this.initialRooms === 0) return 0;
  const occupied = this.initialRooms - this.availableRooms;
  return Math.round((occupied / this.initialRooms) * 100);
});

// Update initialRooms when availableRooms is set if not already set
hostelSchema.pre('save', function(next) {
  if (this.isNew && !this.initialRooms) {
    this.initialRooms = this.availableRooms;
  }
  
  // Ensure availableRooms doesn't exceed initialRooms
  if (this.availableRooms > this.initialRooms) {
    this.availableRooms = this.initialRooms;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Middleware to update rating when reviews change
hostelSchema.statics.updateRating = async function(hostelId) {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { hostel: hostelId } },
    { 
      $group: {
        _id: '$hostel',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await this.findByIdAndUpdate(hostelId, {
      rating: Number(stats[0].avgRating.toFixed(2)),
      numberOfRatings: stats[0].count
    });
  } else {
    await this.findByIdAndUpdate(hostelId, {
      rating: 0,
      numberOfRatings: 0
    });
  }
};

const Hostel = mongoose.model('Hostel', hostelSchema);

export default Hostel;