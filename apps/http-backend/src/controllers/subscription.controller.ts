import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prismaClient } from '@repo/db';
import {
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    SUBSCRIPTION_CONFIG
} from '@repo/backend-common/config';
import {
    getUserSubscription,
    activateSubscription
} from '../services/subscription.service';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for premium subscription
 * POST /v1/subscription/create-order
 */
export const createOrderController = async (req: any, res: Response): Promise<void> => {
    try {
        // Check if Razorpay is configured
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            console.error('Razorpay credentials not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
            res.status(500).json({
                error: 'Payment gateway not configured. Please contact support.',
                details: 'Missing Razorpay credentials'
            });
            return;
        }

        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Check if user already has active premium
        const subscription = await getUserSubscription(userId);
        if (subscription.planType === 'PREMIUM' && subscription.isActive && !subscription.isExpired) {
            res.status(400).json({
                error: 'You already have an active premium subscription',
                subscription
            });
            return;
        }

        // Create Razorpay order
        // Receipt must be <= 40 characters
        const shortUserId = userId.slice(0, 8);
        const timestamp = Date.now().toString(36); // Base36 for shorter string
        const order = await razorpay.orders.create({
            amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_PAISE,
            currency: SUBSCRIPTION_CONFIG.CURRENCY,
            receipt: `sub_${shortUserId}_${timestamp}`,
            notes: {
                userId,
                planType: 'PREMIUM',
            },
        });

        // Save payment record with PENDING status
        const payment = await prismaClient.payment.create({
            data: {
                userId,
                razorpayOrderId: order.id,
                amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_PAISE,
                currency: SUBSCRIPTION_CONFIG.CURRENCY,
                status: 'PENDING',
            },
        });

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: RAZORPAY_KEY_ID,
            paymentId: payment.id,
        });
    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

/**
 * Verify payment after Razorpay checkout (client-side callback)
 * This is called by frontend after successful Razorpay checkout
 * POST /v1/subscription/verify
 */
export const verifyPaymentController = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ error: 'Missing payment verification data' });
            return;
        }

        // Verify signature using Razorpay API secret
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Update payment as failed
            await prismaClient.payment.updateMany({
                where: { razorpayOrderId: razorpay_order_id },
                data: {
                    status: 'FAILED',
                    failureReason: 'Signature verification failed',
                },
            });
            res.status(400).json({ error: 'Invalid payment signature' });
            return;
        }

        // Find and update payment record
        const payment = await prismaClient.payment.findUnique({
            where: { razorpayOrderId: razorpay_order_id },
        });

        if (!payment) {
            res.status(404).json({ error: 'Payment record not found' });
            return;
        }

        // Prevent duplicate processing
        if (payment.status === 'SUCCESS') {
            res.status(200).json({
                message: 'Payment already processed',
                subscription: await getUserSubscription(userId),
            });
            return;
        }

        // Update payment as successful
        await prismaClient.payment.update({
            where: { id: payment.id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'SUCCESS',
            },
        });

        // Activate subscription
        await activateSubscription(userId, payment.id);

        const updatedSubscription = await getUserSubscription(userId);

        res.status(200).json({
            message: 'Payment verified and subscription activated',
            subscription: updatedSubscription,
        });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        res.status(500).json({
            error: 'Failed to verify payment',
            details: error.message
        });
    }
};

/**
 * Handle Razorpay webhook events
 * POST /v1/subscription/webhook
 * This endpoint is public but verified using Razorpay signature
 */
export const webhookController = async (req: Request, res: Response): Promise<void> => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'] as string;

        if (!webhookSignature) {
            res.status(400).json({ error: 'Missing webhook signature' });
            return;
        }

        // Verify webhook signature using API secret
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== webhookSignature) {
            console.error('Webhook signature verification failed');
            res.status(400).json({ error: 'Invalid webhook signature' });
            return;
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log('Received Razorpay webhook:', event);

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;
            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;
            default:
                console.log('Unhandled webhook event:', event);
        }

        // Always respond 200 to acknowledge webhook
        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        // Still return 200 to prevent Razorpay retries
        res.status(200).json({ received: true, error: error.message });
    }
};

/**
 * Handle payment.captured webhook event
 */
async function handlePaymentCaptured(payload: any) {
    const { payment } = payload;
    const orderId = payment.entity.order_id;
    const paymentId = payment.entity.id;

    const existingPayment = await prismaClient.payment.findUnique({
        where: { razorpayOrderId: orderId },
    });

    if (!existingPayment) {
        console.error('Payment record not found for order:', orderId);
        return;
    }

    // Skip if already processed
    if (existingPayment.status === 'SUCCESS') {
        console.log('Payment already processed:', orderId);
        return;
    }

    // Update payment and activate subscription
    await prismaClient.payment.update({
        where: { id: existingPayment.id },
        data: {
            razorpayPaymentId: paymentId,
            status: 'SUCCESS',
        },
    });

    await activateSubscription(existingPayment.userId, existingPayment.id);
    console.log('Subscription activated via webhook for user:', existingPayment.userId);
}

/**
 * Handle payment.failed webhook event
 */
async function handlePaymentFailed(payload: any) {
    const { payment } = payload;
    const orderId = payment.entity.order_id;
    const errorReason = payment.entity.error_description || 'Payment failed';

    await prismaClient.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
            status: 'FAILED',
            failureReason: errorReason,
        },
    });

    console.log('Payment marked as failed:', orderId, errorReason);
}

/**
 * Get current subscription status
 * GET /v1/subscription/status
 */
export const getSubscriptionController = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const subscription = await getUserSubscription(userId);

        res.status(200).json(subscription);
    } catch (error: any) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
};

/**
 * Get payment history
 * GET /v1/subscription/payments
 */
export const getPaymentsController = async (req: any, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const payments = await prismaClient.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
                createdAt: true,
                razorpayOrderId: true,
            },
        });

        res.status(200).json({ payments });
    } catch (error: any) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};
