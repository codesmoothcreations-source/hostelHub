import express from 'express';
import { body, query } from 'express-validator';
import * as messageController from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('to').notEmpty().withMessage('Recipient ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// All routes require authentication
router.use(protect);

// Send message
router.post(
  '/',
  sendMessageValidation,
  validateRequest,
  messageController.sendMessage
);

// Get conversation with a user
router.get(
  '/conversation/:userId',
  queryValidation,
  validateRequest,
  messageController.getConversation
);

// Get unread message count
router.get('/unread', messageController.getUnreadCount);

// Get recent conversations
router.get('/conversations', messageController.getRecentConversations);

// Mark message as read
router.put('/:id/read', messageController.markAsRead);

export default router;