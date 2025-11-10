/**
 * Create Payment Order API Route
 * Creates a Razorpay order for lifetime plan purchase
 */

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

    // Create Razorpay order
    const result = await createOrder({
      amount: price * 100, // Convert to paise
      currency,
      receipt: `receipt_${user._id}_${Date.now()}`,
      notes: {
        userId: (user._id as any).toString(),
        email: user.email,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

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
