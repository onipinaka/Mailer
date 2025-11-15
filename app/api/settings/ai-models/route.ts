import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { encrypt } from '@/lib/security';
import AIModel from '@/models/AIModel';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { provider, apiKey, modelName, label } = body || {};

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'provider and apiKey are required' }, { status: 400 });
    }

    const key = process.env.JWT_SECRET;
    if (!key) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

    const encrypted = encrypt(apiKey, key);

    const aiModel = new AIModel({
      userId: new mongoose.Types.ObjectId(payload.userId),
      provider,
      label: label || `${provider} - ${modelName || 'default'}`,
      modelName,
      encryptedApiKey: encrypted,
    });

    await aiModel.save();

    return NextResponse.json({
      id: aiModel._id,
      provider: aiModel.provider,
      label: aiModel.label,
      modelName: aiModel.modelName,
      createdAt: aiModel.createdAt,
    });
  } catch (err) {
    console.error('Error saving AI model', err);
    return NextResponse.json({ error: 'Failed to save AI model' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const aiModels = await AIModel.find({ userId: payload.userId }).sort({ createdAt: -1 });

    // Return with masked API keys
    const sanitizedModels = aiModels.map((model) => ({
      _id: model._id,
      provider: model.provider,
      label: model.label,
      modelName: model.modelName,
      apiKey: '••••••••', // Masked
      createdAt: model.createdAt,
    }));

    return NextResponse.json({ models: sanitizedModels });
  } catch (err) {
    console.error('Error listing AI models', err);
    return NextResponse.json({ error: 'Failed to list AI models' }, { status: 500 });
  }
}
