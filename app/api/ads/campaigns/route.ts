import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import AdCampaign from '@/models/AdCampaign';
import Integration from '@/models/Integration';
import mongoose from 'mongoose';

// POST - Create ad campaign
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      platform,
      name,
      objective,
      budget,
      targeting,
      creative,
      schedule,
      launchNow,
    } = body;

    if (!platform || !name || !objective || !budget || !creative || !schedule) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create campaign record
    const campaign = new AdCampaign({
      userId: new mongoose.Types.ObjectId(payload.userId),
      platform,
      name,
      objective,
      budget,
      targeting: targeting || {},
      creative,
      schedule,
      status: launchNow ? 'active' : 'draft',
    });

    if (launchNow) {
      // Check if integration exists
      const integration = await Integration.findOne({
        userId: payload.userId,
        platform,
        isActive: true,
      });

      if (!integration) {
        campaign.status = 'failed';
        campaign.error = `No active ${platform} integration found. Connect in Settings.`;
      } else {
        // In production, you would:
        // - For Meta Ads: Use Meta Marketing API to create campaign
        // - For Google Ads: Use Google Ads API
        // - For LinkedIn Ads: Use LinkedIn Marketing API
        // - For TikTok Ads: Use TikTok for Business API
        campaign.platformCampaignId = `sim_${Date.now()}`;
      }
    }

    await campaign.save();

    return NextResponse.json({
      id: campaign._id,
      platform: campaign.platform,
      name: campaign.name,
      status: campaign.status,
      error: campaign.error,
    });
  } catch (err: any) {
    console.error('Error creating ad campaign:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// GET - List ad campaigns
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    const query: any = { userId: payload.userId };
    if (platform) query.platform = platform;
    if (status) query.status = status;

    const campaigns = await AdCampaign.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ campaigns });
  } catch (err: any) {
    console.error('Error fetching campaigns:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
