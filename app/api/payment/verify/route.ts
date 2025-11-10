/**
 * Payment Verification API Route
 * Verifies Razorpay payment signature after successful payment
 */

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/middleware';
import { verifyPaymentSignature } from '@/lib/payment';

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

    // Get payment details from request
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid payment signature');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Check if user already has lifetime plan
    if (user.paidLifetime) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'User already has lifetime plan',
          alreadyUpgraded: true 
        },
        { status: 200 }
      );
    }

    // Upgrade user to lifetime plan
    user.paidLifetime = true;
    user.freeCredits = 0; // Reset free credits
    await user.save();

    console.log(`✅ Payment verified and user ${user.email} upgraded to lifetime plan`);
    console.log(`   Payment ID: ${razorpay_payment_id}`);
    console.log(`   Order ID: ${razorpay_order_id}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Payment verified successfully',
        paidLifetime: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
