/**
 * Security utility functions for input sanitization and XSS prevention
 */

/**
 * Escapes HTML characters to prevent XSS attacks
 * @param unsafe - The unsafe string that may contain HTML
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    return String(unsafe);
  }
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Safely formats content for email templates
 * @param content - The content to format
 * @returns HTML-safe formatted content
 */
export function safeFormatContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Escape the content first to prevent XSS
  const escapedContent = escapeHtml(content);
  
  // Convert plain text to HTML with proper formatting
  return escapedContent
    // Convert line breaks to paragraphs
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim() === '') return '';
      
      // Handle lists (after escaping, so safe)
      if (paragraph.includes('\n- ') || paragraph.includes('\n• ')) {
        const items = paragraph.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('• '));
        const listItems = items.map(item => `<li>${item.replace(/^[•-]\s*/, '').trim()}</li>`).join('');
        return `<ul>${listItems}</ul>`;
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
        const listItems = items.map(item => `<li>${item.replace(/^\d+\.\s*/, '').trim()}</li>`).join('');
        return `<ol>${listItems}</ol>`;
      }
      
      // Handle headers (lines that are all caps or start with #)
      if (paragraph.trim().toUpperCase() === paragraph.trim() && paragraph.length < 60) {
        return `<h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">${paragraph.trim()}</h3>`;
      }
      
      // Regular paragraphs
      return `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

/**
 * Sanitizes HTML content for newsletter display
 * Allows safe HTML tags while preventing XSS
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtmlContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // List of allowed HTML tags for newsletter content
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'blockquote'
  ];
  
  // Basic sanitization - remove script tags and dangerous attributes
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, ''); // Remove data: URLs for security
  
  // Apply email-safe inline styles to common elements
  sanitized = sanitized
    .replace(/<h1[^>]*>/gi, '<h1 style="color: #ef4444; font-size: 24px; font-weight: 700; margin: 24px 0 16px 0; line-height: 1.3;">')
    .replace(/<h2[^>]*>/gi, '<h2 style="color: #ef4444; font-size: 20px; font-weight: 600; margin: 20px 0 12px 0; line-height: 1.3;">')
    .replace(/<h3[^>]*>/gi, '<h3 style="color: #f8fafc; font-size: 18px; font-weight: 600; margin: 16px 0 12px 0; line-height: 1.3;">')
    .replace(/<p[^>]*>/gi, '<p style="color: #e2e8f0; margin: 12px 0; line-height: 1.6;">')
    .replace(/<strong[^>]*>/gi, '<strong style="color: #f8fafc; font-weight: 700;">')
    .replace(/<b[^>]*>/gi, '<b style="color: #f8fafc; font-weight: 700;">')
    .replace(/<em[^>]*>/gi, '<em style="color: #e2e8f0; font-style: italic;">')
    .replace(/<i[^>]*>/gi, '<i style="color: #e2e8f0; font-style: italic;">')
    .replace(/<ul[^>]*>/gi, '<ul style="margin: 12px 0; padding-left: 20px; color: #e2e8f0;">')
    .replace(/<ol[^>]*>/gi, '<ol style="margin: 12px 0; padding-left: 20px; color: #e2e8f0;">')
    .replace(/<li[^>]*>/gi, '<li style="margin: 4px 0; color: #e2e8f0;">')
    .replace(/<a\s+href="([^"]*)"[^>]*>/gi, '<a href="$1" style="color: #ef4444; text-decoration: underline;">')
    .replace(/<blockquote[^>]*>/gi, '<blockquote style="border-left: 4px solid #ef4444; margin: 16px 0; padding: 12px 16px; background-color: #475569; color: #e2e8f0;">');
  
  return sanitized;
}

/**
 * Sanitizes email addresses for display
 * @param email - The email address to sanitize
 * @returns Sanitized email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Basic email validation and escaping
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return escapeHtml(email);
  }
  
  return escapeHtml(email);
}

/**
 * Checks if an email address shows spam patterns
 * @param email - The email address to check
 * @returns True if email appears to be spam
 */
export function isSpamEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return true;
  }
  
  const spamPatterns = [
    // Too many numbers in username
    /^[^@]*\d{4,}[^@]*@/,
    // Random characters pattern
    /^[a-z]{1,3}\d+[a-z]{1,3}\d+@/,
    // Suspicious patterns
    /^(test|spam|fake|temp|noreply|admin)\d*@/i,
    // Too short usernames with numbers
    /^[a-z]{1,2}\d+@/,
    // Repetitive patterns
    /(.)\1{3,}/,
    // Common bot patterns
    /(bot|crawler|spider|scraper)@/i,
  ];
  
  return spamPatterns.some(pattern => pattern.test(email));
}

/**
 * Validates email domain legitimacy
 * @param email - The email address to validate
 * @returns True if domain appears legitimate
 */
export function hasValidDomain(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }
  
  const domain = parts[1].toLowerCase();
  
  // Known suspicious domain patterns
  const suspiciousDomains = [
    // Very short domains
    /^.{1,3}\./,
    // Too many hyphens
    /-{2,}/,
    // Weird TLDs
    /\.(tk|ml|ga|cf)$/,
    // Number-heavy domains
    /\d{3,}/,
  ];
  
  return !suspiciousDomains.some(pattern => pattern.test(domain));
}

/**
 * Checks if submission timing suggests bot behavior
 * @param submissionTime - Time taken to submit form in milliseconds
 * @returns True if timing is suspicious
 */
export function isSuspiciousTiming(submissionTime: number): boolean {
  // Too fast (less than 3 seconds) or unreasonably slow (more than 30 minutes)
  return submissionTime < 3000 || submissionTime > 1800000;
}

/**
 * Gets a more comprehensive error message for production
 * @param error - The error to sanitize
 * @returns Safe error message
 */
export function getSafeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error);
  }
  
  // In production, return generic messages to avoid information leakage
  if (error instanceof Error) {
    // Map specific error types to user-friendly messages
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return 'This information is already registered.';
    }
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return 'Please try again later.';
    }
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'Please check your information and try again.';
    }
  }
  
  return 'An error occurred. Please try again.';
}

/**
 * Sanitizes category names for display
 * @param categories - Array of category names
 * @returns Array of sanitized category names
 */
export function sanitizeCategories(categories: string[]): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }
  
  return categories
    .filter(cat => cat && typeof cat === 'string')
    .map(cat => escapeHtml(cat.trim()))
    .filter(cat => cat.length > 0);
}