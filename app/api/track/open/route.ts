/**
 * Email Open Tracking API Route
 * Records email opens via tracking pixel
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailEvent from '@/models/EmailEvent';

// 1x1 transparent PNG pixel
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (campaignId) {
      await dbConnect();

      // Increment opened count
      await EmailEvent.findOneAndUpdate(
        { campaignId },
        { $inc: { opened: 1 } }
      );
    }

    // Return 1x1 transparent pixel
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Track open error:', error);
    // Return pixel even on error to avoid broken images
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }
}
