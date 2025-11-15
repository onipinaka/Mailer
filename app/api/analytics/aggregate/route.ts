import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import SocialPost from '@/models/SocialPost';
import AdCampaign from '@/models/AdCampaign';
import Lead from '@/models/Lead';
import RecipientStatus from '@/models/RecipientStatus';

export const dynamic = 'force-dynamic';

// GET - Aggregate analytics across all channels
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    const baseQuery: any = { userId: payload.userId };
    if (Object.keys(dateQuery).length > 0) {
      baseQuery.createdAt = dateQuery;
    }

    // Email campaigns analytics (using RecipientStatus)
    const recipientStatuses = await RecipientStatus.find(baseQuery);
    const emailStats = recipientStatuses.reduce(
      (acc: any, record: any) => ({
        totalSent: acc.totalSent + 1,
        totalOpened: acc.totalOpened + (record.opened ? 1 : 0),
        totalClicked: acc.totalClicked + (record.clicked ? 1 : 0),
        totalBounced: acc.totalBounced + (record.bounced ? 1 : 0),
      }),
      { totalSent: 0, totalOpened: 0, totalClicked: 0, totalBounced: 0 }
    );

    const emailStatsWithRates = {
      ...emailStats,
      campaigns: recipientStatuses.length > 0 ? 1 : 0,
      openRate: emailStats.totalSent > 0 ? (emailStats.totalOpened / emailStats.totalSent) * 100 : 0,
      clickRate: emailStats.totalSent > 0 ? (emailStats.totalClicked / emailStats.totalSent) * 100 : 0,
      bounceRate: emailStats.totalSent > 0 ? (emailStats.totalBounced / emailStats.totalSent) * 100 : 0,
    };

    // Social media analytics
    const socialPosts = await SocialPost.find(baseQuery);
    const socialStats = socialPosts.reduce(
      (acc, post) => ({
        totalPosts: acc.totalPosts + 1,
        totalLikes: acc.totalLikes + (post.engagement?.likes || 0),
        totalComments: acc.totalComments + (post.engagement?.comments || 0),
        totalShares: acc.totalShares + (post.engagement?.shares || 0),
        totalViews: acc.totalViews + (post.engagement?.views || 0),
      }),
      { totalPosts: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalViews: 0 }
    );

    socialStats.engagementRate =
      socialStats.totalViews > 0
        ? ((socialStats.totalLikes + socialStats.totalComments + socialStats.totalShares) /
            socialStats.totalViews) *
          100
        : 0;

    // Ad campaigns analytics
    const adCampaigns = await AdCampaign.find(baseQuery);
    const adStats = adCampaigns.reduce(
      (acc, campaign) => ({
        totalCampaigns: acc.totalCampaigns + 1,
        totalSpent: acc.totalSpent + (campaign.metrics?.spent || 0),
        totalImpressions: acc.totalImpressions + (campaign.metrics?.impressions || 0),
        totalClicks: acc.totalClicks + (campaign.metrics?.clicks || 0),
        totalConversions: acc.totalConversions + (campaign.metrics?.conversions || 0),
      }),
      { totalCampaigns: 0, totalSpent: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0 }
    );

    adStats.ctr = adStats.totalImpressions > 0 ? (adStats.totalClicks / adStats.totalImpressions) * 100 : 0;
    adStats.cpc = adStats.totalClicks > 0 ? adStats.totalSpent / adStats.totalClicks : 0;
    adStats.cpa = adStats.totalConversions > 0 ? adStats.totalSpent / adStats.totalConversions : 0;

    // Lead analytics
    const leads = await Lead.find(baseQuery);
    const leadStatsBase = leads.reduce(
      (acc: any, lead: any) => {
        acc.totalLeads += 1;
        if (lead.status === 'new') acc.newLeads += 1;
        if (lead.status === 'contacted') acc.contacted += 1;
        if (lead.status === 'qualified') acc.qualified += 1;
        if (lead.status === 'converted') acc.converted += 1;
        if (lead.status === 'lost') acc.lost += 1;
        return acc;
      },
      { totalLeads: 0, newLeads: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 }
    );

    const leadStats = {
      ...leadStatsBase,
      conversionRate: leadStatsBase.totalLeads > 0 ? (leadStatsBase.converted / leadStatsBase.totalLeads) * 100 : 0,
    };

    // Overall metrics
    const overallMetricsBase = {
      totalCampaigns: emailStatsWithRates.campaigns + socialStats.totalPosts + adStats.totalCampaigns,
      totalReach: emailStatsWithRates.totalSent + socialStats.totalViews + adStats.totalImpressions,
      totalEngagement: emailStatsWithRates.totalClicked + socialStats.totalLikes + adStats.totalClicks,
      totalConversions: leadStats.converted + adStats.totalConversions,
      totalSpent: adStats.totalSpent,
    };

    const overallMetrics = {
      ...overallMetricsBase,
      roi:
        overallMetricsBase.totalSpent > 0
          ? ((overallMetricsBase.totalConversions * 100 - overallMetricsBase.totalSpent) /
              overallMetricsBase.totalSpent) *
            100
          : 0,
    };

    return NextResponse.json({
      dateRange: { startDate, endDate },
      email: emailStatsWithRates,
      social: socialStats,
      ads: adStats,
      leads: leadStats,
      overall: overallMetrics,
    });
  } catch (err: any) {
    console.error('Error aggregating analytics:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to aggregate analytics' },
      { status: 500 }
    );
  }
}
