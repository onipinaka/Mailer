/**
 * SendGrid Webhook API Route
 * Handles SendGrid event webhooks (delivered, bounced, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailEvent from '@/models/EmailEvent';

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();

    await dbConnect();

    // Process each event
    for (const event of events) {
      const campaignId = event.campaignId || event.category?.[0];

      if (!campaignId) continue;

      // Update based on event type
      switch (event.event) {
        case 'delivered':
          await EmailEvent.findOneAndUpdate(
            { campaignId },
            { $inc: { delivered: 1 } }
          );
          break;

        case 'bounce':
        case 'dropped':
          await EmailEvent.findOneAndUpdate(
            { campaignId },
            { $inc: { bounced: 1 } }
          );
          break;

        case 'open':
          await EmailEvent.findOneAndUpdate(
            { campaignId },
            { $inc: { opened: 1 } }
          );
          break;
      }
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
