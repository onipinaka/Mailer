/**
 * Payment Webhook API Route
 * Handles Razorpay payment success webhooks
 * Verifies signature and upgrades user to lifetime plan
 */

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
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook data
    const event = JSON.parse(body);

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;

      if (!userId) {
        console.error('No userId in payment notes');
        return NextResponse.json(
          { error: 'Invalid payment data' },
          { status: 400 }
        );
      }

      await dbConnect();

      // Find and update user
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found:', userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Upgrade to lifetime plan
      if (!user.paidLifetime) {
        user.paidLifetime = true;
        user.freeCredits = 0; // No longer needed
        await user.save();

        console.log(`✅ User ${user.email} upgraded to lifetime plan`);
      }

      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    // Acknowledge other events
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
