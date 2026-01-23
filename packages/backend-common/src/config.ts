import { config } from "dotenv"

config()

export const JWT_SECRET = process.env.JWT_SECRET
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3002/v1'

// Razorpay Configuration
// Note: Razorpay uses the API secret for webhook signature verification
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

// Subscription Configuration (all amounts in paise)
export const SUBSCRIPTION_CONFIG = {
    PREMIUM_PRICE_PAISE: 100000, // ₹1000 - Update this to your actual price
    PREMIUM_DURATION_DAYS: 30,
    FREE_CANVAS_LIMIT: 2,
    PREMIUM_CANVAS_LIMIT: 10,
    CURRENCY: 'INR',
} as const
