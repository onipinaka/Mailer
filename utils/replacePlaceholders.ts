/**
 * Placeholder Replacement Utility
 * Replaces {{variable}} placeholders in email templates with actual values
 */

export interface PlaceholderData {
  [key: string]: string | number;
}

/**
 * Replaces placeholders in template with actual data
 * Example: "Hello {{name}}" with {name: "John"} becomes "Hello John"
 */
export function replacePlaceholders(template: string, data: PlaceholderData): string {
  let result = template;
  
  // Replace all {{variable}} patterns
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    result = result.replace(regex, String(data[key] || ''));
  });

  return result;
}

/**
 * Extracts all placeholder variables from a template
 * Example: "Hello {{name}}, welcome to {{company}}" returns ["name", "company"]
 */
export function extractPlaceholders(template: string): string[] {
  const regex = /\{\{\s*(\w+)\s*\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
}

/**
 * Validates that CSV headers contain all required placeholders
 */
export function validatePlaceholders(
  template: string,
  csvHeaders: string[]
): { valid: boolean; missing: string[] } {
  const required = extractPlaceholders(template);
  const lowerHeaders = csvHeaders.map(h => h.toLowerCase());
  const missing = required.filter(
    placeholder => !lowerHeaders.includes(placeholder.toLowerCase())
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}
