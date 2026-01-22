import { Router } from 'express';
import express from 'express';
import {
    createOrderController,
    verifyPaymentController,
    webhookController,
    getSubscriptionController,
    getPaymentsController,
} from '../controllers/subscription.controller';
import { middleware } from '../middlwares/middleware';

const router: Router = Router();

// Webhook endpoint - needs raw body for signature verification
// Must use express.raw() since this router is registered before express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), webhookController);

// All other routes need JSON body parsing
// Apply express.json() middleware to these routes since router is before global express.json()
router.post('/create-order', express.json(), middleware, createOrderController);
router.post('/verify', express.json(), middleware, verifyPaymentController);
router.get('/status', middleware, getSubscriptionController);
router.get('/payments', middleware, getPaymentsController);

export default router;
