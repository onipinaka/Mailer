/**
 * Rate Limiter Utility
 * Implements simple in-memory rate limiting for API endpoints
 * Prevents brute force attacks on login/register
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if the identifier (IP or email) has exceeded the rate limit
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining attempts for an identifier
   */
  getRemaining(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset (in seconds)
   */
  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry) return 0;
    const remaining = entry.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }
}

// Create singleton instances for different endpoints
export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const registerLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
export const sendEmailLimiter = new RateLimiter(10, 60 * 1000); // 10 sends per minute

export default RateLimiter;
