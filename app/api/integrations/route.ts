import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Integration from '@/models/Integration';
import { encrypt } from '@/lib/security';
import mongoose from 'mongoose';

// POST - Create or update integration
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { platform, credentials, config } = body;

    if (!platform || !credentials) {
      return NextResponse.json({ error: 'platform and credentials are required' }, { status: 400 });
    }

    const key = process.env.JWT_SECRET;
    if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

    // Encrypt credentials
    const encryptedCredentials = encrypt(JSON.stringify(credentials), key);

    // Check if integration already exists
    let integration = await Integration.findOne({
      userId: payload.userId,
      platform,
    });

    if (integration) {
      // Update existing
      integration.encryptedCredentials = encryptedCredentials;
      integration.config = config || integration.config;
      integration.active = true;
      integration.lastSync = new Date();
      await integration.save();
    } else {
      // Create new
      integration = new Integration({
        userId: new mongoose.Types.ObjectId(payload.userId),
        platform,
        encryptedCredentials,
        config: config || {},
        active: true,
        lastSync: new Date(),
      });
      await integration.save();
    }

    return NextResponse.json({
      id: integration._id,
      platform: integration.platform,
      active: integration.active,
      lastSync: integration.lastSync,
    });
  } catch (err: any) {
    console.error('Error saving integration:', err);
    return NextResponse.json({ error: err.message || 'Failed to save integration' }, { status: 500 });
  }
}

// GET - List integrations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const integrations = await Integration.find({ userId: payload.userId }).sort({ createdAt: -1 });

    const sanitized = integrations.map((integration) => ({
      _id: integration._id,
      platform: integration.platform,
      active: integration.active,
      lastSync: integration.lastSync,
      createdAt: integration.createdAt,
    }));

    return NextResponse.json({ integrations: sanitized });
  } catch (err: any) {
    console.error('Error fetching integrations:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch integrations' }, { status: 500 });
  }
}

// DELETE - Remove integration
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const result = await Integration.deleteOne({
      _id: id,
      userId: payload.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting integration:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete integration' }, { status: 500 });
  }
}
