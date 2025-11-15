import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { encrypt, maskSensitiveData } from '@/lib/security';
import SMSCredential from '@/models/SMSCredential';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { provider, fromNumber, config, label } = body || {};

    if (!provider || !fromNumber || !config) {
      return NextResponse.json({ error: 'provider, fromNumber and config are required' }, { status: 400 });
    }

    // Encrypt config JSON with server key
    const key = process.env.JWT_SECRET;
    if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

    const encrypted = encrypt(JSON.stringify(config), key);

    const cred = new SMSCredential({
      userId: new mongoose.Types.ObjectId(payload.userId),
      provider,
      label: label || provider,
      fromNumber,
      encryptedConfig: encrypted,
    });

    await cred.save();

    return NextResponse.json({
      id: cred._id,
      provider: cred.provider,
      label: cred.label,
      fromNumber: cred.fromNumber,
      createdAt: cred.createdAt,
    });
  } catch (err) {
    console.error('Error saving SMS credential', err);
    return NextResponse.json({ error: 'Failed to save SMS credential' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const creds = await SMSCredential.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

    const safe = creds.map(c => ({
      id: c._id,
      provider: c.provider,
      label: c.label,
      fromNumber: c.fromNumber,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ credentials: safe });
  } catch (err) {
    console.error('Error listing SMS credentials', err);
    return NextResponse.json({ error: 'Failed to list SMS credentials' }, { status: 500 });
  }
}
