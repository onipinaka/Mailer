/**
 * Register API Route
 * Handles user registration with email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mail';
import { registerLimiter } from '@/utils/rateLimiter';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  recaptchaToken: z.string().optional(), // Make optional for development
});

/**
 * Verify Google reCAPTCHA token
 */
async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  // Skip reCAPTCHA in development if not configured
  if (!token || token === 'no-captcha-in-dev') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  reCAPTCHA skipped in development mode');
      return true;
    }
    return false;
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  reCAPTCHA secret key not configured, allowing in dev mode');
      return true;
    }
    console.error('reCAPTCHA secret key not configured');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!registerLimiter.check(clientIp)) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: registerLimiter.getResetTime(clientIp)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, recaptchaToken } = validation.data;

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password (bcrypt with 12 salt rounds for security)
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      verified: false,
      verificationToken,
      verificationTokenExpiry,
      freeCredits: 100,
      paidLifetime: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
