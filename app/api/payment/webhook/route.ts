/**
 * Payment Webhook API Route
 * Handles Razorpay payment success webhooks
 * Verifies signature and upgrades user to lifetime plan
 */

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyWebhookSignature } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook data
    const event = JSON.parse(body);
    
    console.log('📥 Razorpay webhook received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        return await handlePaymentCaptured(event);
      
      case 'payment.failed':
        console.log('❌ Payment failed:', event.payload.payment.entity.id);
        return NextResponse.json({ success: true }, { status: 200 });
      
      case 'order.paid':
        console.log('✅ Order paid:', event.payload.order.entity.id);
        return NextResponse.json({ success: true }, { status: 200 });
      
      default:
        console.log('ℹ️ Unhandled event type:', event.event);
        return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(event: any) {
  try {
    const payment = event.payload.payment.entity;
    const userId = payment.notes?.userId;

    if (!userId) {
      console.error('❌ No userId in payment notes');
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already upgraded
    if (user.paidLifetime) {
      console.log('ℹ️ User already has lifetime plan:', user.email);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Upgrade to lifetime plan
    user.paidLifetime = true;
    user.freeCredits = 0; // No longer needed
    await user.save();

    console.log('✅ User upgraded to lifetime plan via webhook');
    console.log('   Email:', user.email);
    console.log('   Payment ID:', payment.id);
    console.log('   Amount:', payment.amount / 100, payment.currency);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error handling payment.captured:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
