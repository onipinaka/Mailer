import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Chatbot from '@/models/Chatbot';
import mongoose from 'mongoose';

// POST - Create chatbot
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, platform, personality, knowledgeBase, flows, aiModel, enableAI } = body;

    if (!name || !platform) {
      return NextResponse.json({ error: 'name and platform are required' }, { status: 400 });
    }

    const chatbot = new Chatbot({
      userId: new mongoose.Types.ObjectId(payload.userId),
      name,
      description,
      platform,
      personality: personality || {},
      knowledgeBase,
      flows: flows || [],
      aiModel: aiModel ? new mongoose.Types.ObjectId(aiModel) : undefined,
      enableAI: enableAI || false,
    });

    await chatbot.save();

    return NextResponse.json({
      id: chatbot._id,
      name: chatbot.name,
      platform: chatbot.platform,
      status: chatbot.status,
      createdAt: chatbot.createdAt,
    });
  } catch (err: any) {
    console.error('Error creating chatbot:', err);
    return NextResponse.json({ error: err.message || 'Failed to create chatbot' }, { status: 500 });
  }
}

// GET - List chatbots
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

    const chatbots = await Chatbot.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ chatbots });
  } catch (err: any) {
    console.error('Error fetching chatbots:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch chatbots' }, { status: 500 });
  }
}
