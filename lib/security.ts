/**
 * Security Utilities
 * Input validation, sanitization, and security helpers
 */

import crypto from 'crypto';

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '');

  // Remove data: protocol (except for images)
  cleaned = cleaned.replace(/(<(?!img)[^>]+\s+(?:src|href)\s*=\s*["'])data:/gi, '$1');

  // Remove iframe tags
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove object and embed tags
  cleaned = cleaned.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // Remove form tags (optional, depends on use case)
  // cleaned = cleaned.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

  return cleaned;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data (for logging, etc.)
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  // Allowed file types
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only CSV files are allowed.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit.' };
  }

  // Check for dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.html'];
  const hasExtension = dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (hasExtension) {
    return { valid: false, error: 'Invalid file extension.' };
  }

  return { valid: true };
}

/**
 * Sanitize user input (prevent injection)
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Remove null bytes
  let cleaned = input.replace(/\0/g, '');

  // Trim whitespace
  cleaned = cleaned.trim();

  // Remove control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');

  return cleaned;
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Prevent timing attacks on string comparison
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return generateSecureToken(32);
}

/**
 * Validate URL to prevent open redirect
 */
export function isValidRedirectUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsedUrl = new URL(url);
    return allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(ip: string, endpoint: string): string {
  return `ratelimit:${hashSensitiveData(ip)}:${endpoint}`;
}

/**
 * Encrypt sensitive data (AES-256-GCM)
 */
export function encrypt(text: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const keyHash = crypto.createHash('sha256').update(key).digest();
  
  const cipher = crypto.createCipheriv(algorithm, keyHash, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data (AES-256-GCM)
 */
export function decrypt(encryptedText: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const parts = encryptedText.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const keyHash = crypto.createHash('sha256').update(key).digest();
  
  const decipher = crypto.createDecipheriv(algorithm, keyHash, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Validate request signature (for webhooks)
 */
export function validateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return secureCompare(signature, expectedSignature);
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  return 'sk_' + generateSecureToken(32);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  return data.substring(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}

/**
 * Check if IP is in allowed list
 */
export function isIpAllowed(ip: string, allowedIps: string[]): boolean {
  return allowedIps.includes(ip) || allowedIps.includes('*');
}

/**
 * Validate environment variables
 */
export function validateEnvVars(requiredVars: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
