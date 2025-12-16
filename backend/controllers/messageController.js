import asyncWrapper from '../middleware/asyncWrapper.js';
import * as messageService from '../services/messageService.js';
import { sendResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc    Send a message
// @route   POST /api/v1/messages
// @access  Private
export const sendMessage = asyncWrapper(async (req, res) => {
  const { to, content } = req.body;
  
  if (!to || !content) {
    return sendResponse(res, 400, false, 'Recipient and message content are required');
  }
  
  // Don't allow sending message to self
  if (to === req.user._id.toString()) {
    return sendResponse(res, 400, false, 'Cannot send message to yourself');
  }
  
  const result = await messageService.createMessage(req.user._id, to, content);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to send message');
  }
  
  // Emit socket event (handled in server.js)
  req.app.get('io').to(`user_${to}`).emit('new_message', result.message);
  
  logger.info(`Message sent from ${req.user._id} to ${to}`);
  
  return sendResponse(res, 201, true, 'Message sent successfully', {
    message: result.message
  });
});

// @desc    Get conversation with a user
// @route   GET /api/v1/messages/conversation/:userId
// @access  Private
export const getConversation = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;
  
  const result = await messageService.getConversation(
    req.user._id,
    req.params.userId,
    parseInt(limit),
    skip
  );
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to get conversation');
  }
  
  return sendResponse(res, 200, true, 'Conversation retrieved', {
    messages: result.messages,
    count: result.count
  });
});

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread
// @access  Private
export const getUnreadCount = asyncWrapper(async (req, res) => {
  const result = await messageService.getUnreadCount(req.user._id);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to get unread count');
  }
  
  return sendResponse(res, 200, true, 'Unread count retrieved', {
    count: result.count
  });
});

// @desc    Get recent conversations
// @route   GET /api/v1/messages/conversations
// @access  Private
export const getRecentConversations = asyncWrapper(async (req, res) => {
  const result = await messageService.getRecentConversations(req.user._id);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to get conversations');
  }
  
  return sendResponse(res, 200, true, 'Recent conversations retrieved', {
    conversations: result.conversations
  });
});

// @desc    Mark message as read
// @route   PUT /api/v1/messages/:id/read
// @access  Private
export const markAsRead = asyncWrapper(async (req, res) => {
  const result = await messageService.markAsRead(req.params.id, req.user._id);
  
  if (!result.success) {
    return sendResponse(res, 400, false, result.message || 'Failed to mark message as read');
  }
  
  return sendResponse(res, 200, true, 'Message marked as read', {
    message: result.message
  });
});