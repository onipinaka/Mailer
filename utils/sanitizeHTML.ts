/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize HTML content before sending emails
 * Prevents XSS attacks by removing malicious scripts
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes
 */
export function sanitizeHTML(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'style', 'class', 'id', 'target', 'rel',
      'width', 'height', 'align', 'border', 'cellpadding', 'cellspacing'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
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
