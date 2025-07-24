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