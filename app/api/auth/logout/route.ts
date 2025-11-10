/**
 * Logout API Route
 * Clears authentication cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  clearAuthCookies(response);

  return response;
}
