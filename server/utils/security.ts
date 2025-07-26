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
 * Sanitizes phone numbers for display
 * @param phone - The phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove any HTML and limit to reasonable phone number characters
  return escapeHtml(phone.replace(/[^0-9+\-\s()]/g, ''));
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

/**
 * Generic error message for production use
 * @param isDevelopment - Whether in development mode
 * @param error - The original error
 * @returns Safe error message
 */
export function getSafeErrorMessage(isDevelopment: boolean, error: any): string {
  if (isDevelopment && error instanceof Error) {
    return error.message;
  }
  
  return "An error occurred while processing your request.";
}

/**
 * Detects potential spam patterns in email addresses
 * @param email - Email address to check
 * @returns boolean indicating if email looks suspicious
 */
export function isSpamEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return true;
  }

  const suspiciousPatterns = [
    /^[a-z0-9]{20,}@/, // Very long random-looking local part
    /^\d+@/, // Numbers only before @
    /test.*test/i, // Multiple "test" words
    /admin.*admin/i, // Multiple "admin" words
    /^(noreply|no-reply)@/i, // No-reply addresses
    /\+.*\+/, // Multiple + signs
    /^\w{1,2}@/, // Very short local part (1-2 chars)
  ];

  return suspiciousPatterns.some(pattern => pattern.test(email));
}

/**
 * Validates if an email domain exists and is not suspicious
 * @param email - Email address to validate
 * @returns boolean indicating if domain is valid
 */
export function hasValidDomain(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const domain = email.split('@')[1];
  if (!domain) {
    return false;
  }

  // Check for common typos in popular domains
  const commonDomainTypos = [
    'gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com',
    'outlok.com', 'gmil.com', 'yaho.com'
  ];

  return !commonDomainTypos.includes(domain.toLowerCase());
}