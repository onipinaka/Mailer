/**
 * Unsubscribe API Route
 * Handles email unsubscribe requests
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Unsubscribe from '@/models/Unsubscribe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const campaignId = searchParams.get('campaignId');
    const reason = searchParams.get('reason');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Add to unsubscribe list
    await Unsubscribe.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        campaignId,
        reason,
      },
      { upsert: true }
    );

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(
      new URL('/unsubscribe/success', request.url)
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
