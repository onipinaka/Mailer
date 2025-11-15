/**
 * Authentication Middleware
 * Protects API routes by verifying JWT tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to verify JWT token from cookies
 * Returns user data if valid, null otherwise
 */
export async function authenticate(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: { userId: string; email: string };
  response?: NextResponse;
}> {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Try to verify access token
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      return {
        authenticated: true,
        user: { userId: payload.userId, email: payload.email },
      };
    }
  }

  // Access token expired, try refresh token
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: payload.userId,
        email: payload.email,
      });

      // Create response with new access token
      const response = NextResponse.next();
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60,
      });

      return {
        authenticated: true,
        user: { userId: payload.userId, email: payload.email },
        response,
      };
    }
  }

  return { authenticated: false };
}

/**
 * Extract user from request cookies
 */
export function getUserFromRequest(request: NextRequest): { userId: string; email: string } | null {
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken) {
    return null;
  }

  const payload = verifyAccessToken(accessToken);
  return payload ? { userId: payload.userId, email: payload.email } : null;
}
