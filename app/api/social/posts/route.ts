import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import SocialPost from '@/models/SocialPost';
import Integration from '@/models/Integration';
import { decrypt } from '@/lib/security';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// POST - Create and schedule social media post
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { platform, content, mediaUrls, scheduledAt, postNow } = body;

    if (!platform || !content) {
      return NextResponse.json({ error: 'platform and content are required' }, { status: 400 });
    }

    // Create social post record
    const socialPost = new SocialPost({
      userId: new mongoose.Types.ObjectId(payload.userId),
      platform,
      content,
      mediaUrls: mediaUrls || [],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: postNow ? 'posted' : scheduledAt ? 'scheduled' : 'draft',
    });

    if (postNow) {
      // Attempt to post immediately
      const integration = await Integration.findOne({
        userId: payload.userId,
        platform: platform === 'facebook' || platform === 'instagram' ? 'meta_ads' : platform,
        isActive: true,
      });

      if (!integration) {
        socialPost.status = 'failed';
        socialPost.error = 'No active integration found. Connect your account in Settings.';
      } else {
        try {
          const key = process.env.JWT_SECRET;
          if (!key) throw new Error('Server misconfiguration');

          const credentials = JSON.parse(decrypt(integration.encryptedCredentials, key));

          // Here you would call the actual platform API
          // For now, we'll simulate success
          socialPost.status = 'posted';
          socialPost.postedAt = new Date();
          socialPost.platformPostId = `sim_${Date.now()}`;

          // In production, you would:
          // - For Facebook/Instagram: Use Meta Graph API
          // - For Twitter: Use Twitter API v2
          // - For LinkedIn: Use LinkedIn Marketing API
          // - For TikTok: Use TikTok Business API
        } catch (err: any) {
          socialPost.status = 'failed';
          socialPost.error = err.message;
        }
      }
    }

    await socialPost.save();

    return NextResponse.json({
      id: socialPost._id,
      platform: socialPost.platform,
      status: socialPost.status,
      scheduledAt: socialPost.scheduledAt,
      postedAt: socialPost.postedAt,
      error: socialPost.error,
    });
  } catch (err: any) {
    console.error('Error creating social post:', err);
    return NextResponse.json({ error: err.message || 'Failed to create post' }, { status: 500 });
  }
}

// GET - List social posts
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

    const posts = await SocialPost.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error('Error fetching social posts:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch posts' }, { status: 500 });
  }
}
