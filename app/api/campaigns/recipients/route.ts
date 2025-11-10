/**
 * Campaign Recipients API Route
 * Returns detailed recipient list for a specific campaign
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RecipientStatus from '@/models/RecipientStatus';
import { getUserFromRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
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

    // Get campaign ID from query params
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Get all recipients for this campaign
    const recipients = await RecipientStatus.find({
      userId: authUser.userId,
      campaignId: campaignId,
    }).sort({ sentAt: -1 });

    // Group by status
    const groupedRecipients = {
      all: recipients,
      sent: recipients.filter(r => r.status === 'sent'),
      delivered: recipients.filter(r => r.status === 'delivered'),
      opened: recipients.filter(r => r.status === 'opened'),
      bounced: recipients.filter(r => r.status === 'bounced'),
      failed: recipients.filter(r => r.status === 'failed'),
    };

    return NextResponse.json({
      campaignId,
      totalRecipients: recipients.length,
      recipients: groupedRecipients,
      counts: {
        all: recipients.length,
        sent: groupedRecipients.sent.length,
        delivered: groupedRecipients.delivered.length,
        opened: groupedRecipients.opened.length,
        bounced: groupedRecipients.bounced.length,
        failed: groupedRecipients.failed.length,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign recipients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
