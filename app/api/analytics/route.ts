/**
 * Analytics API Route
 * Returns email campaign statistics for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailEvent from '@/models/EmailEvent';
import { getUserFromRequest } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

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

    // Get all campaigns for user
    const campaigns = await EmailEvent.find({ userId: authUser.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate totals
    const totals = campaigns.reduce(
      (acc, campaign) => ({
        sent: acc.sent + campaign.sent,
        delivered: acc.delivered + campaign.delivered,
        opened: acc.opened + campaign.opened,
        bounced: acc.bounced + campaign.bounced,
        failed: acc.failed + campaign.failed,
      }),
      { sent: 0, delivered: 0, opened: 0, bounced: 0, failed: 0 }
    );

    // Calculate rates
    const averageOpenRate = totals.delivered > 0 
      ? (totals.opened / totals.delivered) * 100
      : 0;
    
    const averageDeliveryRate = totals.sent > 0
      ? (totals.delivered / totals.sent) * 100
      : 0;

    return NextResponse.json(
      {
        success: true,
        totalCampaigns: campaigns.length,
        totalSent: totals.sent,
        totalDelivered: totals.delivered,
        totalOpened: totals.opened,
        totalBounced: totals.bounced,
        totalFailed: totals.failed,
        averageOpenRate,
        averageDeliveryRate,
        campaigns: campaigns.map(c => ({
          campaignId: c.campaignId,
          subject: c.subject,
          sent: c.sent,
          delivered: c.delivered,
          opened: c.opened,
          bounced: c.bounced,
          failed: c.failed,
          recipients: c.recipients,
          sendMethod: c.sendMethod,
          createdAt: c.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
