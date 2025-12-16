import express from 'express';
import * as webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Paystack webhook (public route)
router.post('/paystack', webhookController.paystackWebhook);

export default router;