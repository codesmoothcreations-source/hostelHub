import Message from '../models/Message.js';
import logger from '../utils/logger.js';

// Create message
const createMessage = async (from, to, content) => {
  try {
    const message = await Message.create({
      from,
      to,
      content
    });
    
    // Populate sender details
    const populatedMessage = await Message.findById(message._id)
      .populate('from', 'name avatar')
      .populate('to', 'name avatar');
    
    return {
      success: true,
      message: populatedMessage
    };
  } catch (error) {
    logger.error('Create message error:', error);
    throw error;
  }
};

// Get conversation
const getConversation = async (userA, userB, limit = 50, skip = 0) => {
  try {
    const messages = await Message.getConversation(userA, userB, limit, skip);
    
    // Mark unread messages as read
    await Message.updateMany(
      {
        from: userB,
        to: userA,
        read: false
      },
      { read: true }
    );
    
    return {
      success: true,
      messages,
      count: messages.length
    };
  } catch (error) {
    logger.error('Get conversation error:', error);
    throw error;
  }
};

// Get unread count
const getUnreadCount = async (userId) => {
  try {
    const count = await Message.countDocuments({
      to: userId,
      read: false
    });
    
    return {
      success: true,
      count
    };
  } catch (error) {
    logger.error('Get unread count error:', error);
    throw error;
  }
};

// Get recent conversations
const getRecentConversations = async (userId) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: userId },
            { to: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from', userId] },
              '$to',
              '$from'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$to', userId] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar',
            role: '$user.role'
          },
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1
        }
      },
      { $sort: { lastMessageTime: -1 } },
      { $limit: 20 }
    ]);
    
    return {
      success: true,
      conversations
    };
  } catch (error) {
    logger.error('Get recent conversations error:', error);
    throw error;
  }
};

// Mark message as read
const markAsRead = async (messageId, userId) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        to: userId,
        read: false
      },
      { read: true },
      { new: true }
    );
    
    if (!message) {
      return {
        success: false,
        message: 'Message not found or already read'
      };
    }
    
    return {
      success: true,
      message
    };
  } catch (error) {
    logger.error('Mark as read error:', error);
    throw error;
  }
};

export {
  createMessage,
  getConversation,
  getUnreadCount,
  getRecentConversations,
  markAsRead
};