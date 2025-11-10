/**
 * HTML Sanitization Utility
 * Lightweight HTML sanitizer for serverless environments
 * Prevents XSS attacks by removing malicious scripts
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses regex-based approach for serverless compatibility
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  
  let clean = dirty;
  
  // Remove script tags and their content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  
  // Remove data: URIs (except images)
  clean = clean.replace(/data:(?!image\/)[^,]*,/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'meta', 'link', 'style', 'base'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    clean = clean.replace(regex, '');
    clean = clean.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
  });
  
  return clean;
}

/**
 * Validates email addresses
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes plain text input
 */
export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '');
}
