import paystack from '../config/paystack.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Initialize payment
const initializePayment = async ({ email, amount, reference, metadata = {} }) => {
  try {
    // Convert amount to kobo (smallest currency unit for Paystack)
    // Note: Paystack expects amount in kobo for Naira
    // For GHS, amount should be in pesewas (1 GHS = 100 pesewas)
    const amountInPesewas = Math.round(amount * 100);
    
    const response = await paystack.post('/transaction/initialize', {
      email,
      amount: amountInPesewas,
      reference,
      currency: 'GHS', // Use GHS if supported
      metadata,
      callback_url: `${process.env.FRONTEND_URL}/booking/verify?reference=${reference}`
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    logger.error('Paystack initialization error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to initialize payment'
    };
  }
};

// Verify transaction
const verifyTransaction = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    
    if (response.data.status && response.data.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        verified: true
      };
    }
    
    return {
      success: false,
      data: response.data.data,
      verified: false,
      message: response.data.data.gateway_response || 'Payment not successful'
    };
  } catch (error) {
    logger.error('Paystack verification error:', error.response?.data || error.message);
    return {
      success: false,
      verified: false,
      message: error.response?.data?.message || 'Failed to verify payment'
    };
  }
};

// Handle webhook
const handleWebhook = async (req) => {
  try {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    // Verify signature
    if (hash !== req.headers['x-paystack-signature']) {
      throw new Error('Invalid signature');
    }
    
    const event = req.body;
    
    // Only process charge.success events
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      return await verifyTransaction(reference);
    }
    
    return {
      success: true,
      message: 'Webhook received but no action required'
    };
  } catch (error) {
    logger.error('Paystack webhook error:', error);
    throw error;
  }
};

// Create transfer recipient (for owner payouts)
const createTransferRecipient = async ({ type, name, account_number, bank_code, currency = 'GHS' }) => {
  try {
    const response = await paystack.post('/transferrecipient', {
      type,
      name,
      account_number,
      bank_code,
      currency
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    logger.error('Paystack transfer recipient error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create transfer recipient'
    };
  }
};

export {
  initializePayment,
  verifyTransaction,
  handleWebhook,
  createTransferRecipient
};