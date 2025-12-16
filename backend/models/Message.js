import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide sender']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide recipient']
  },
  content: {
    type: String,
    required: [true, 'Please provide message content'],
    maxlength: [1000, 'Message cannot be more than 1000 characters'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
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

// Index for conversation queries
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, read: 1, createdAt: -1 });

// Update timestamp on save
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get conversation
messageSchema.statics.getConversation = async function(userA, userB, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA }
    ]
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('from', 'name avatar')
  .populate('to', 'name avatar');
};

const Message = mongoose.model('Message', messageSchema);

export default Message;