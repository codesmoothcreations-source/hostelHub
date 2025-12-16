import asyncWrapper from '../middleware/asyncWrapper.js';
import * as paystackService from '../services/paystackService.js';
import * as bookingService from '../services/bookingService.js';
import logger from '../utils/logger.js';

// @desc    Paystack webhook handler
// @route   POST /api/v1/webhook/paystack
// @access  Public
export const paystackWebhook = asyncWrapper(async (req, res) => {
  try {
    // Handle webhook
    const result = await paystackService.handleWebhook(req);
    
    if (result.verified && result.data) {
      // Verify booking
      await bookingService.verifyBooking(result.data.reference);
      
      logger.info(`Webhook processed successfully: ${result.data.reference}`);
    }
    
    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    logger.error('Webhook error:', error);
    // Still respond with 200 to prevent Paystack from retrying
    res.status(200).json({ success: false, message: 'Webhook processing failed' });
  }
});