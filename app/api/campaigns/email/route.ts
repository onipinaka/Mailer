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
import type { Transporter } from 'nodemailer';

export const dynamic = 'force-dynamic';

// Helper function to create transporter with proper configuration
async function createTransporter(credential: any, password: string): Promise<Transporter> {
  let transportConfig: any;

  if (credential.provider === 'gmail') {
    transportConfig = {
      service: 'gmail',
      auth: {
        user: credential.email,
        pass: password,
      },
      pool: true, // Use connection pooling
      maxConnections: 5, // Max simultaneous connections
      maxMessages: 100, // Max messages per connection
      rateDelta: 1000, // Time between rate limited messages
      rateLimit: 5, // Max messages per rateDelta
      // Timeout settings
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
    };
  } else if (credential.provider === 'smtp') {
    const key = process.env.JWT_SECRET;
    if (!key) throw new Error('Server misconfiguration');
    
    const config = JSON.parse(decrypt(credential.encryptedPassword, key));
    transportConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      // Timeout settings
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      // Additional SMTP settings
      tls: {
        rejectUnauthorized: false, // More lenient for various SMTP servers
      },
    };
  } else {
    throw new Error('Unsupported email provider');
  }

  const transporter = nodemailer.createTransport(transportConfig);
  
  // Verify connection before returning
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('SMTP verification failed:', error);
    throw new Error(`Failed to connect to email server: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return transporter;
}

// Helper function to send email with retry logic
async function sendEmailWithRetry(
  transporter: Transporter,
  mailOptions: any,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Send attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      // Don't retry on certain errors
      if (
        lastError.message.includes('Invalid login') ||
        lastError.message.includes('Authentication failed') ||
        lastError.message.includes('Recipient address rejected')
      ) {
        throw lastError; // These errors won't be fixed by retrying
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Failed to send email after retries');
}

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
  let transporter: Transporter | null = null;
  
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

    // Create and verify transporter with connection pooling
    console.log(`Creating transporter for ${credential.provider}...`);
    transporter = await createTransporter(credential, password);
    console.log('Transporter created and verified successfully');

    let successCount = 0;
    let failedCount = 0;

    // Send emails with delay
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        // Check if job was paused
        const currentJob = await Job.findById(jobId);
        if (currentJob?.status === 'paused') {
          console.log('Job paused, stopping email campaign');
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

        // Send email with retry logic
        console.log(`Sending email ${i + 1}/${recipients.length} to ${recipient.email}...`);
        await sendEmailWithRetry(transporter, {
          from: credential.email,
          to: recipient.email,
          subject: personalizedSubject,
          html: personalizedHtml,
        });
        console.log(`Email sent successfully to ${recipient.email}`);

        // Record success
        await RecipientStatus.create({
          userId: new mongoose.Types.ObjectId(userId),
          campaignId: jobId,
          recipientEmail: recipient.email,
          recipientName: recipient.name || recipient.firstName || '',
          status: 'sent',
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
          campaignId: jobId,
          recipientEmail: recipient.email,
          recipientName: recipient.name || recipient.firstName || '',
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          sentAt: new Date(),
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

    // Close transporter connection pool
    if (transporter) {
      console.log('Closing transporter connection pool...');
      transporter.close();
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
    
    console.log(`Campaign completed: ${successCount} sent, ${failedCount} failed`);
  } catch (err: any) {
    console.error('Email campaign job error:', err);
    
    // Close transporter on error
    if (transporter) {
      try {
        transporter.close();
      } catch (closeErr) {
        console.error('Error closing transporter:', closeErr);
      }
    }
    
    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err.message || 'Unknown error',
      completedAt: new Date(),
    });
  }
}
