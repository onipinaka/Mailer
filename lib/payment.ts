/**
 * Razorpay Payment Integration
 * Handles order creation and webhook verification
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials not configured');
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export interface OrderData {
  amount: number; // in paise (4000 INR = 400000 paise)
  currency: string;
  receipt: string;
  notes?: {
    userId: string;
    email: string;
  };
}

/**
 * Create a Razorpay order
 */
export async function createOrder(orderData: OrderData) {
  try {
    const order = await razorpay.orders.create({
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: 'Failed to create payment order',
    };
  }
}

/**
 * Verify Razorpay webhook signature
 * This ensures the webhook is genuinely from Razorpay
 */
export function verifyWebhookSignature(
  webhookBody: string,
  webhookSignature: string
): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error('Webhook secret not configured');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify payment signature (for client-side verification)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Payment signature verification error:', error);
    return false;
  }
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: 'Failed to fetch payment details',
    };
  }
}
