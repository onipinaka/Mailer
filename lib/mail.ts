/**
 * Email Sending Utilities
 * Supports Gmail, custom SMTP, and SendGrid
 */

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { sanitizeHTML } from '@/utils/sanitizeHTML';
import { replacePlaceholders, PlaceholderData } from '@/utils/replacePlaceholders';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailConfig {
  method: 'gmail' | 'smtp' | 'sendgrid';
  gmail?: {
    user: string;
    password: string; // App password
  };
  smtp?: {
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
  };
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  trackingPixel?: string;
  unsubscribeLink?: string;
}

/**
 * Send email via Gmail using Nodemailer
 */
async function sendViaGmail(
  config: EmailConfig['gmail'],
  emailData: EmailData
): Promise<boolean> {
  if (!config) {
    throw new Error('Gmail configuration missing');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  try {
    await transporter.sendMail({
      from: config.user,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
    return true;
  } catch (error) {
    console.error('Gmail send error:', error);
    return false;
  }
}

/**
 * Send email via custom SMTP using Nodemailer
 */
async function sendViaSMTP(
  config: EmailConfig['smtp'],
  emailData: EmailData
): Promise<boolean> {
  if (!config) {
    throw new Error('SMTP configuration missing');
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  try {
    await transporter.sendMail({
      from: config.user,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
    return true;
  } catch (error) {
    console.error('SMTP send error:', error);
    return false;
  }
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(emailData: EmailData): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@mailpulse.com';
  const fromName = process.env.SENDGRID_FROM_NAME || 'MailPulse';

  try {
    await sgMail.send({
      to: emailData.to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: emailData.subject,
      html: emailData.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid send error:', error);
    return false;
  }
}

/**
 * Main send email function
 */
export async function sendEmail(
  config: EmailConfig,
  emailData: EmailData
): Promise<boolean> {
  // Sanitize HTML
  emailData.html = sanitizeHTML(emailData.html);

  // Add tracking pixel if provided
  if (emailData.trackingPixel) {
    emailData.html += `<img src="${emailData.trackingPixel}" width="1" height="1" alt="" />`;
  }

  // Add unsubscribe link if provided
  if (emailData.unsubscribeLink) {
    emailData.html += `<br/><br/><p style="font-size: 12px; color: #666;">
      <a href="${emailData.unsubscribeLink}">Unsubscribe</a>
    </p>`;
  }

  switch (config.method) {
    case 'gmail':
      return sendViaGmail(config.gmail, emailData);
    case 'smtp':
      return sendViaSMTP(config.smtp, emailData);
    case 'sendgrid':
      return sendViaSendGrid(emailData);
    default:
      throw new Error('Invalid email method');
  }
}

/**
 * Send bulk emails with personalization
 */
export async function sendBulkEmails(
  config: EmailConfig,
  recipients: PlaceholderData[],
  subject: string,
  htmlTemplate: string,
  campaignId: string
): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  for (const recipient of recipients) {
    try {
      // Personalize subject and content
      const personalizedSubject = replacePlaceholders(subject, recipient);
      const personalizedHtml = replacePlaceholders(htmlTemplate, recipient);

      // Generate tracking pixel URL
      const trackingPixel = `${appUrl}/api/track/open?campaignId=${campaignId}&email=${recipient.email}`;
      
      // Generate unsubscribe link
      const unsubscribeLink = `${appUrl}/unsubscribe?email=${recipient.email}&campaignId=${campaignId}`;

      const success = await sendEmail(config, {
        to: recipient.email as string,
        subject: personalizedSubject,
        html: personalizedHtml,
        trackingPixel,
        unsubscribeLink,
      });

      if (success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${recipient.email}`);
      }

      // Rate limiting: wait 100ms between emails to avoid spam filters
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.failed++;
      results.errors.push(`Error sending to ${recipient.email}: ${error}`);
    }
  }

  return results;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to MailPulse!</h2>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #666;">
        If you didn't create an account, please ignore this email.
      </p>
    </div>
  `;

  return sendViaSendGrid({
    to: email,
    subject: 'Verify Your Email - MailPulse',
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #666;">
        If you didn't request a password reset, please ignore this email.
      </p>
    </div>
  `;

  return sendViaSendGrid({
    to: email,
    subject: 'Reset Your Password - MailPulse',
    html,
  });
}
