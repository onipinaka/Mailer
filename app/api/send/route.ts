/**
 * Send Campaign API Route
 * Handles bulk email sending with personalization
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import EmailEvent from '@/models/EmailEvent';
import RecipientStatus from '@/models/RecipientStatus';
import Unsubscribe from '@/models/Unsubscribe';
import EmailCredential from '@/models/EmailCredential';
import { getUserFromRequest } from '@/lib/middleware';
import { sendBulkEmails, EmailConfig } from '@/lib/mail';
import { isValidEmail } from '@/utils/sanitizeHTML';
import { validatePlaceholders, PlaceholderData } from '@/utils/replacePlaceholders';
import { sendEmailLimiter } from '@/utils/rateLimiter';
import { decrypt } from '@/lib/security';
import { z } from 'zod';

const sendCampaignSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  htmlTemplate: z.string().min(1, 'Email template is required'),
  recipients: z.array(z.record(z.any())).min(1, 'At least one recipient is required'),
  sendMethod: z.enum(['gmail', 'smtp', 'sendgrid']),
  config: z.object({
    credentialId: z.string().optional(),
    gmail: z.object({
      user: z.string().email(),
      password: z.string(),
    }).optional(),
    smtp: z.object({
      host: z.string(),
      port: z.number(),
      user: z.string(),
      password: z.string(),
      secure: z.boolean(),
    }).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!sendEmailLimiter.check(authUser.userId)) {
      return NextResponse.json(
        { 
          error: 'Too many send requests. Please wait a moment.',
          retryAfter: sendEmailLimiter.getResetTime(authUser.userId)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = sendCampaignSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { subject, htmlTemplate, recipients, sendMethod, config } = validation.data;

    await dbConnect();

    // Get user
    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check credits
    const recipientCount = recipients.length;
    if (!user.paidLifetime && user.freeCredits < recipientCount) {
      return NextResponse.json(
        { 
          error: `Insufficient credits. You have ${user.freeCredits} credits but need ${recipientCount}.`,
          requiredCredits: recipientCount,
          availableCredits: user.freeCredits,
        },
        { status: 402 }
      );
    }

    // Validate email addresses
    const invalidEmails = recipients.filter(r => !isValidEmail(r.email as string));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: 'Some email addresses are invalid', invalidEmails },
        { status: 400 }
      );
    }

    // Validate placeholders
    const csvHeaders = Object.keys(recipients[0]);
    const placeholderValidation = validatePlaceholders(htmlTemplate, csvHeaders);
    if (!placeholderValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Template contains placeholders not found in CSV',
          missing: placeholderValidation.missing,
        },
        { status: 400 }
      );
    }

    // Filter out unsubscribed emails
    const unsubscribedEmails = await Unsubscribe.find({
      email: { $in: recipients.map(r => r.email) },
    });
    const unsubscribedSet = new Set(unsubscribedEmails.map(u => u.email));
    
    const filteredRecipients = recipients.filter(
      r => !unsubscribedSet.has((r.email as string).toLowerCase())
    );

    if (filteredRecipients.length === 0) {
      return NextResponse.json(
        { error: 'All recipients have unsubscribed' },
        { status: 400 }
      );
    }

    // Create email config
    let emailConfig: EmailConfig = {
      method: sendMethod,
    };

    // If credentialId is provided, fetch and decrypt the saved credential
    if (config?.credentialId) {
      const credential = await EmailCredential.findOne({
        _id: config.credentialId,
        userId: authUser.userId,
      });

      if (!credential) {
        return NextResponse.json(
          { error: 'Saved credential not found' },
          { status: 404 }
        );
      }

      // Decrypt the password
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      try {
        const decryptedPassword = decrypt(credential.encryptedPassword, jwtSecret);

        if (sendMethod === 'gmail' && credential.provider === 'gmail') {
          emailConfig.gmail = {
            user: credential.email,
            password: decryptedPassword,
          };
        } else if (sendMethod === 'smtp' && credential.provider === 'smtp') {
          // For SMTP, we need additional config from the credential
          // For now, assume Gmail SMTP settings
          emailConfig.smtp = {
            host: 'smtp.gmail.com',
            port: 587,
            user: credential.email,
            password: decryptedPassword,
            secure: false,
          };
        }
      } catch (err) {
        console.error('Failed to decrypt credential:', err);
        return NextResponse.json(
          { error: 'Failed to decrypt saved credential' },
          { status: 500 }
        );
      }
    } else {
      // Use manually provided credentials
      if (sendMethod === 'gmail' && config?.gmail) {
        emailConfig.gmail = config.gmail;
      } else if (sendMethod === 'smtp' && config?.smtp) {
        emailConfig.smtp = config.smtp;
      }
    }

    // Generate campaign ID
    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Send emails
    const result = await sendBulkEmails(
      emailConfig,
      filteredRecipients as PlaceholderData[],
      subject,
      htmlTemplate,
      campaignId
    );

    // Save individual recipient statuses
    const recipientDocs = result.recipientResults.map(r => ({
      userId: user._id,
      campaignId,
      recipientEmail: r.email,
      recipientName: r.name || '',
      status: r.status === 'sent' ? 'delivered' : 'failed',
      errorMessage: r.errorMessage,
      sentAt: new Date(),
      deliveredAt: r.status === 'sent' ? new Date() : undefined,
    }));

    await RecipientStatus.insertMany(recipientDocs);

    // Deduct credits for free users
    if (!user.paidLifetime) {
      user.freeCredits = Math.max(0, user.freeCredits - result.sent);
      await user.save();
    }

    // Save campaign analytics
    await EmailEvent.create({
      userId: user._id,
      campaignId,
      subject,
      sent: result.sent,
      delivered: result.sent,
      opened: 0,
      bounced: 0,
      failed: result.failed,
      recipients: filteredRecipients.length,
      sendMethod,
    });

    return NextResponse.json(
      {
        success: true,
        campaignId,
        sent: result.sent,
        failed: result.failed,
        skipped: recipients.length - filteredRecipients.length,
        remainingCredits: user.paidLifetime ? 'unlimited' : user.freeCredits,
        errors: result.errors.slice(0, 10), // Limit error messages
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
