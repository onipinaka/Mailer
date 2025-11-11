import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Job from '@/models/Job';
import EmailCredential from '@/models/EmailCredential';
import RecipientStatus from '@/models/RecipientStatus';
import { decrypt } from '@/lib/security';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// POST - Start email campaign as background job
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { subject, html, recipients, credentialId, sendDelay = 0 } = body;

    if (!subject || !html || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create background job
    const job = new Job({
      userId: new mongoose.Types.ObjectId(payload.userId),
      type: 'email_campaign',
      status: 'pending',
      totalItems: recipients.length,
      data: {
        subject,
        html,
        recipients,
        credentialId,
        sendDelay,
      },
    });

    await job.save();

    // Start processing in background
    processEmailCampaign(job._id.toString(), payload.userId, subject, html, recipients, credentialId, sendDelay);

    return NextResponse.json({
      success: true,
      jobId: job._id,
      message: `Email campaign started with ${recipients.length} recipients. Check Jobs page for progress.`,
    });
  } catch (err: any) {
    console.error('Error starting email campaign:', err);
    return NextResponse.json({ error: err.message || 'Failed to start campaign' }, { status: 500 });
  }
}

// Background job processor for email campaign
async function processEmailCampaign(
  jobId: string,
  userId: string,
  subject: string,
  html: string,
  recipients: any[],
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

    // Get email credential
    const credential = await EmailCredential.findOne({
      _id: credentialId,
      userId,
    });

    if (!credential) {
      throw new Error('Email credential not found');
    }

    const key = process.env.JWT_SECRET;
    if (!key) throw new Error('Server misconfiguration');

    const password = decrypt(credential.encryptedPassword, key);

    // Create transporter based on provider
    let transporter;
    if (credential.provider === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: credential.email,
          pass: password,
        },
      });
    } else if (credential.provider === 'smtp') {
      const config = JSON.parse(decrypt(credential.encryptedPassword, key));
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });
    } else {
      throw new Error('Unsupported email provider');
    }

    let successCount = 0;
    let failedCount = 0;

    // Send emails with delay
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        // Check if job was paused
        const currentJob = await Job.findById(jobId);
        if (currentJob?.status === 'paused') {
          break;
        }

        // Personalize email
        let personalizedHtml = html;
        let personalizedSubject = subject;
        Object.keys(recipient).forEach((key) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          personalizedHtml = personalizedHtml.replace(regex, recipient[key] || '');
          personalizedSubject = personalizedSubject.replace(regex, recipient[key] || '');
        });

        // Send email
        await transporter.sendMail({
          from: credential.email,
          to: recipient.email,
          subject: personalizedSubject,
          html: personalizedHtml,
        });

        // Record success
        await RecipientStatus.create({
          userId: new mongoose.Types.ObjectId(userId),
          recipientEmail: recipient.email,
          subject: personalizedSubject,
          sent: true,
          sentAt: new Date(),
        });

        successCount++;

        // Update job progress
        await Job.findByIdAndUpdate(jobId, {
          processedItems: i + 1,
          successCount,
          failedCount,
          progress: Math.round(((i + 1) / recipients.length) * 100),
        });

        // Apply delay between sends
        if (sendDelay > 0 && i < recipients.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, sendDelay * 1000));
        }
      } catch (err) {
        console.error(`Failed to send email to ${recipient.email}:`, err);
        failedCount++;

        // Record failure
        await RecipientStatus.create({
          userId: new mongoose.Types.ObjectId(userId),
          recipientEmail: recipient.email,
          subject,
          sent: false,
          bounced: true,
        });

        // Update job progress
        await Job.findByIdAndUpdate(jobId, {
          processedItems: i + 1,
          successCount,
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
        sent: successCount,
        failed: failedCount,
        total: recipients.length,
      },
    });
  } catch (err: any) {
    console.error('Email campaign job error:', err);
    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err.message || 'Unknown error',
      completedAt: new Date(),
    });
  }
}
