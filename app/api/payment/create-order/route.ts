/**
 * Create Payment Order API Route
 * Creates a Razorpay order for lifetime plan purchase
 */

// Force Node.js runtime for Razorpay SDK compatibility
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/middleware';
import { createOrder } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user
    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has lifetime plan
    if (user.paidLifetime) {
      return NextResponse.json(
        { error: 'You already have a lifetime plan' },
        { status: 400 }
      );
    }

    // Get price from environment or default
    const price = parseInt(process.env.LIFETIME_PRICE || '4000');
    const currency = process.env.LIFETIME_PRICE_CURRENCY || 'INR';

    // Generate short receipt ID (max 40 chars for Razorpay)
    // Format: rcpt_<timestamp>_<short_user_id>
    const timestamp = Date.now();
    const shortUserId = (user._id as any).toString().slice(-8); // Last 8 chars of user ID
    const receiptId = `rcpt_${timestamp}_${shortUserId}`; // ~25 chars

    // Create Razorpay order
    const result = await createOrder({
      amount: price * 100, // Convert to paise
      currency,
      receipt: receiptId,
      notes: {
        userId: (user._id as any).toString(),
        email: user.email,
      },
    });

    if (!result.success) {
      console.error('❌ Order creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create payment order' },
        { status: 500 }
      );
    }

    console.log('✅ Order created successfully');
    console.log('   Receipt:', receiptId);
    console.log('   Order ID:', result.orderId);
    console.log('   Amount:', result.amount / 100, currency);

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
