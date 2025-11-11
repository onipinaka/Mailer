import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Job from '@/models/Job';
import SMSCredential from '@/models/SMSCredential';
import { decrypt } from '@/lib/security';
import twilio from 'twilio';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// POST - Start SMS campaign as background job
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { message, recipients, credentialId, sendDelay = 0 } = body;

    if (!message || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!credentialId) {
      return NextResponse.json({ error: 'Please select an SMS provider' }, { status: 400 });
    }

    // Create background job
    const job = new Job({
      userId: new mongoose.Types.ObjectId(payload.userId),
      type: 'sms_campaign',
      status: 'pending',
      totalItems: recipients.length,
      data: {
        message,
        recipients,
        credentialId,
        sendDelay,
      },
    });

    await job.save();

    // Start processing in background
    processSMSCampaign(job._id.toString(), payload.userId, message, recipients, credentialId, sendDelay);

    return NextResponse.json({
      success: true,
      jobId: job._id,
      totalRecipients: recipients.length,
      message: 'SMS campaign started. Check Jobs page for progress.',
    });
  } catch (err: any) {
    console.error('Error starting SMS campaign:', err);
    return NextResponse.json({ error: err.message || 'Failed to start campaign' }, { status: 500 });
  }
}

// Background SMS campaign processor
async function processSMSCampaign(
  jobId: string,
  userId: string,
  message: string,
  recipients: string[],
  credentialId: string,
  sendDelay: number
) {
  try {
    await dbConnect();

    // Update job status
    await Job.findByIdAndUpdate(jobId, {
      status: 'processing',
      startedAt: new Date(),
    });

    // Get SMS credentials
    const credential = await SMSCredential.findOne({
      _id: credentialId,
      userId,
    });

    if (!credential) {
      throw new Error('SMS credential not found');
    }

    const key = process.env.JWT_SECRET;
    if (!key) throw new Error('Server misconfiguration');

    const config = JSON.parse(decrypt(credential.encryptedConfig, key));
    const client = twilio(config.accountSid, config.authToken);

    let successCount = 0;
    let failedCount = 0;

    // Send SMS with delay
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        await client.messages.create({
          from: credential.fromNumber,
          to: recipient,
          body: message,
        });

        successCount++;

        // Update job progress
        await Job.findByIdAndUpdate(jobId, {
          processedItems: i + 1,
          successCount,
          failedCount,
          progress: Math.round(((i + 1) / recipients.length) * 100),
        });

        // Apply delay between SMS
        if (sendDelay > 0 && i < recipients.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, sendDelay * 1000));
        }
      } catch (err) {
        console.error(`Failed to send SMS to ${recipient}:`, err);
        failedCount++;

        await Job.findByIdAndUpdate(jobId, {
          processedItems: i + 1,
          failedCount,
          progress: Math.round(((i + 1) / recipients.length) * 100),
        });
      }
    }

    // Mark job as completed
    await Job.findByIdAndUpdate(jobId, {
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      result: {
        totalSent: recipients.length,
        successCount,
        failedCount,
      },
    });
  } catch (err) {
    console.error('SMS campaign processing error:', err);
    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
      completedAt: new Date(),
    });
  }
}
