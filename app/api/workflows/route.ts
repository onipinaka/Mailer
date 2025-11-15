import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Workflow from '@/models/Workflow';
import mongoose from 'mongoose';

/**
 * Workflow Automation Engine
 * Create and manage automation workflows
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, trigger, actions, active = true } = body || {};

    if (!name || !trigger || !actions) {
      return NextResponse.json({ error: 'name, trigger, and actions are required' }, { status: 400 });
    }

    const workflow = new Workflow({
      userId: new mongoose.Types.ObjectId(payload.userId),
      name,
      description,
      trigger,
      actions,
      active,
    });

    await workflow.save();

    return NextResponse.json({
      id: workflow._id,
      name: workflow.name,
      trigger: workflow.trigger,
      actions: workflow.actions,
      active: workflow.active,
      createdAt: workflow.createdAt,
    });
  } catch (err) {
    console.error('Error creating workflow', err);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const workflows = await Workflow.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ workflows });
  } catch (err) {
    console.error('Error fetching workflows', err);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}
