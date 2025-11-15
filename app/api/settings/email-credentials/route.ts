import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { encrypt, maskSensitiveData, isValidEmail } from '@/lib/security';
import EmailCredential from '@/models/EmailCredential';
import mongoose from 'mongoose';

/**
 * POST: Save encrypted email credential for current user
 * GET: List stored credentials (masked)
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { provider, email, password } = body || {};

    if (!provider || !email || !password) {
      return NextResponse.json({ error: 'provider, email and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (provider !== 'gmail' && provider !== 'smtp' && provider !== 'sendgrid') {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // Use JWT secret to encrypt stored password (ensure JWT_SECRET exists)
    const key = process.env.JWT_SECRET;
    if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

    const encrypted = encrypt(String(password), key);

    const cred = new EmailCredential({
      userId: new mongoose.Types.ObjectId(payload.userId),
      provider,
      email,
      encryptedPassword: encrypted,
    });

    await cred.save();

    return NextResponse.json({
      id: cred._id,
      provider: cred.provider,
      email: cred.email,
      password: maskSensitiveData(String(password), 3),
      createdAt: cred.createdAt,
    });
  } catch (err) {
    console.error('Error saving email credential', err);
    return NextResponse.json({ error: 'Failed to save credential' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const creds = await EmailCredential.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

    const safe = creds.map(c => ({
      id: c._id,
      provider: c.provider,
      email: c.email,
      password: maskSensitiveData(String(c.encryptedPassword), 3), // masked encrypted blob
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ credentials: safe });
  } catch (err) {
    console.error('Error listing credentials', err);
    return NextResponse.json({ error: 'Failed to list credentials' }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await EmailCredential.deleteOne({
      _id: id,
      userId: payload.userId, // Ensure user can only delete their own credentials
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Credential deleted' });
  } catch (err) {
    console.error('Error deleting credential', err);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
  }
}
