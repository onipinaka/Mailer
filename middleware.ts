/**
 * Next.js Middleware for Security and Route Protection
 * Implements CSP, security headers, rate limiting, and authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
              request.headers.get('x-real-ip') || 
              'unknown';

  // ==================== SECURITY HEADERS ====================
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
    "frame-src 'self' https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // ==================== RATE LIMITING ====================

  // API routes rate limiting
  if (pathname.startsWith('/api/')) {
    // Different limits for different endpoints
    let maxRequests = 100; // Default: 100 requests per minute
    let windowMs = 60 * 1000; // 1 minute

    // Stricter limits for sensitive endpoints (relaxed for testing)
    if (pathname.startsWith('/api/auth/login')) {
      maxRequests = 10; // 10 attempts per 5 minutes
      windowMs = 5 * 60 * 1000;
    } else if (pathname.startsWith('/api/auth/register')) {
      maxRequests = 5; // 5 registrations per 15 minutes
      windowMs = 15 * 60 * 1000;
    } else if (pathname.startsWith('/api/payment/')) {
      maxRequests = 20; // 20 payment attempts per 5 minutes
      windowMs = 5 * 60 * 1000;
    } else if (pathname.startsWith('/api/send')) {
      maxRequests = 30; // 30 campaign sends per hour
      windowMs = 60 * 60 * 1000;
    }

    const identifier = `${ip}:${pathname}`;
    
    if (!checkRateLimit(identifier, maxRequests, windowMs)) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(
            (rateLimitStore.get(identifier)?.resetTime || Date.now()) - Date.now()
          ) / 1000
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(windowMs / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Add rate limit headers
    const record = rateLimitStore.get(identifier);
    if (record) {
      response.headers.set('X-RateLimit-Limit', String(maxRequests));
      response.headers.set('X-RateLimit-Remaining', String(maxRequests - record.count));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
    }
  }

  // ==================== AUTHENTICATION CHECK ====================

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/api/send',
    '/api/campaigns',
    '/api/analytics',
    '/api/payment/create-order',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('accessToken')?.value;

    // If no token and it's a dashboard page, redirect to login
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If no token and it's an API route, return 401
    if (!token && pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
  }

  // ==================== CORS HEADERS FOR API ====================

  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');

    // Set CORS headers for API routes
    if (origin) {
      // Normalize incoming origin and allowed origins
      const requestUrl = new URL(request.url);

      const normalize = (u: string) => {
        try {
          return new URL(u).origin;
        } catch {
          // if no protocol provided, assume https
          try {
            return new URL(`https://${u}`).origin;
          } catch {
            return u;
          }
        }
      };

      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        `https://${requestUrl.host}`, // same origin by default
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ]
        .filter(Boolean)
        .map(v => normalize(v as string));

      const normalizedOrigin = normalize(origin);

      // In production, validate origin strictly; in development allow local origins
      let isAllowed = false;

      if (process.env.NODE_ENV === 'production') {
        // Allow if normalized origin exactly matches any allowed origin
        if (allowedOrigins.includes(normalizedOrigin)) {
          isAllowed = true;
        }

        // Fallback: allow same-host origins (handles subdomains and Vercel aliases)
        if (!isAllowed && normalizedOrigin.endsWith(requestUrl.host)) {
          isAllowed = true;
        }
      } else {
        // In non-production, be permissive to aid testing (but still expose CORS headers)
        isAllowed = true;
      }

      if (!isAllowed) {
        return NextResponse.json({ error: 'CORS policy violation' }, { status: 403 });
      }

      // Set CORS headers
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
  }

  // ==================== PREVENT CLICKJACKING ====================

  // Ensure embedding is disabled
  response.headers.set('X-Frame-Options', 'DENY');

  return response;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
