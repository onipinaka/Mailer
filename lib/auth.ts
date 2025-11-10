/**
 * JWT Authentication Utilities
 * Handles JWT token generation, verification, and cookie management
 */

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_SECRET + '_refresh';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generates access token (15 minutes expiry)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generates refresh token (7 days expiry)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verifies refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Sets authentication cookies in response
 */
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  // HTTP-only cookies for security
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };

  response.cookies.set('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}

/**
 * Clears authentication cookies
 */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}

/**
 * Generates a random verification token
 */
export function generateVerificationToken(): string {
  return jwt.sign(
    { random: Math.random() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Generates a random reset password token
 */
export function generateResetToken(): string {
  return jwt.sign(
    { random: Math.random() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}
