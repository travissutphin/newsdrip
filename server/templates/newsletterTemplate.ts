import { escapeHtml, safeFormatContent, sanitizeEmail, sanitizeCategories } from '../utils/security';

interface NewsletterTemplateData {
  title: string;
  content: string;
  subscriberEmail: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  companyName?: string;
  companyAddress?: string;
  categories: string[];
}

export function generateNewsletterHTML(data: NewsletterTemplateData): string {
  const {
    title,
    content,
    subscriberEmail,
    unsubscribeUrl,
    preferencesUrl,
    companyName = "NewsletterPro",
    companyAddress = "Your Company Address",
    categories
  } = data;

  // Sanitize all input data to prevent XSS
  const safeTitle = escapeHtml(title);
  const safeContent = safeFormatContent(content);
  const safeEmail = sanitizeEmail(subscriberEmail);
  const safeCompanyName = escapeHtml(companyName);
  const safeCompanyAddress = escapeHtml(companyAddress);
  const safeCategories = sanitizeCategories(categories);

  // Get current date for header
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <style>
        /* Email-safe CSS */
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
        }
        .email-wrapper {
            background-color: #f5f5f5;
            padding: 20px 0;
        }
        .email-container {
            max-width: 680px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        /* Header Section */
        .header-bar {
            background-color: #ffffff;
            padding: 16px 32px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header-date {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
        }
        .header-links {
            font-size: 14px;
        }
        .header-links a {
            color: #374151;
            text-decoration: none;
            margin-left: 16px;
        }
        .header-links a:hover {
            text-decoration: underline;
        }
        
        /* Brand Header */
        .brand-header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 48px 32px;
            text-align: center;
            position: relative;
        }
        .brand-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        .brand-logo {
            position: relative;
            z-index: 2;
        }
        .brand-logo h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -1px;
            text-transform: uppercase;
        }
        .brand-logo .tagline {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        /* Sponsor Section */
        .sponsor-section {
            background-color: #f9fafb;
            padding: 24px 32px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
        }
        .sponsor-text {
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sponsor-logo {
            font-size: 18px;
            font-weight: 700;
            color: #2563eb;
        }
        /* Content Section */
        .content {
            padding: 32px 32px 24px 32px;
        }
        .newsletter-title {
            color: #111827;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 24px 0;
            line-height: 1.2;
        }
        .newsletter-intro {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 24px 0;
            line-height: 1.4;
        }
        .content p {
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 18px 0;
            color: #374151;
        }
        .content ul, .content ol {
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 18px 24px;
            color: #374151;
        }
        .content li {
            margin-bottom: 8px;
        }
        .content a {
            color: #2563eb;
            text-decoration: underline;
        }
        .content a:hover {
            color: #1d4ed8;
        }
        
        /* Categories Section */
        .categories {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 8px;
        }
        .categories h3 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .category-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .category-tag {
            background-color: #2563eb;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Divider */
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 32px 0;
        }
        
        /* Thank You Section */
        .thank-you-section {
            text-align: center;
            padding: 24px 0;
            background-color: #f9fafb;
            margin: 32px 0;
            border-radius: 8px;
        }
        .thank-you-section p {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 16px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .cta-button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            text-decoration: none;
        }
        /* Footer Section */
        .footer {
            background-color: #f9fafb;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
        }
        .footer-address {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 24px 0;
            line-height: 1.5;
        }
        .footer-links {
            margin: 24px 0;
            padding: 0;
        }
        .footer-links a {
            color: #2563eb;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            margin: 0 12px;
            padding: 8px 0;
            display: inline-block;
        }
        .footer-links a:hover {
            text-decoration: underline;
            color: #1d4ed8;
        }
        .social-links {
            margin: 24px 0;
            padding: 16px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
        }
        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #6b7280;
            text-decoration: none;
            font-size: 24px;
            transition: color 0.2s;
        }
        .social-links a:hover {
            color: #2563eb;
        }
        .unsubscribe {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 24px;
            line-height: 1.6;
        }
        .unsubscribe a {
            color: #2563eb;
            text-decoration: none;
        }
        .unsubscribe a:hover {
            text-decoration: underline;
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 680px) {
            .email-wrapper {
                padding: 0;
            }
            .email-container {
                margin: 0;
                border-radius: 0;
                max-width: 100%;
            }
            .header-bar {
                padding: 12px 20px;
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }
            .header-links a {
                margin: 0 8px;
            }
            .brand-header {
                padding: 32px 20px;
            }
            .brand-logo h1 {
                font-size: 28px;
            }
            .sponsor-section {
                padding: 16px 20px;
            }
            .content {
                padding: 24px 20px;
            }
            .newsletter-title {
                font-size: 24px;
            }
            .newsletter-intro {
                font-size: 16px;
            }
            .categories {
                margin: 20px 0;
                padding: 12px 16px;
            }
            .category-tags {
                gap: 6px;
            }
            .thank-you-section {
                margin: 24px 0;
                padding: 20px 16px;
            }
            .footer {
                padding: 24px 20px;
            }
            .footer-links a {
                display: block;
                margin: 8px 0;
                padding: 4px 0;
            }
            .social-links a {
                margin: 0 8px;
                font-size: 20px;
            }
        }
        
        /* Outlook specific fixes */
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        /* Prevent auto-scaling in iOS */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
            .email-container {
                -webkit-text-size-adjust: none;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Top Header Bar -->
            <div class="header-bar">
                <p class="header-date">${currentDate}</p>
                <div class="header-links">
                    <a href="${preferencesUrl}">View Online</a>
                    <a href="${preferencesUrl}">Sign Up</a>
                    <a href="https://example.com">Shop</a>
                </div>
            </div>
            
            <!-- Brand Header -->
            <div class="brand-header">
                <div class="brand-logo">
                    <h1>Newsletter Pro</h1>
                    <p class="tagline">Your daily dose of insights</p>
                </div>
            </div>
            
            <!-- Sponsor Section -->
            <div class="sponsor-section">
                <p class="sponsor-text">Together With</p>
                <div class="sponsor-logo">Your Business Partner</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <h1 class="newsletter-title">${safeTitle}</h1>
                
                <!-- Categories -->
                ${safeCategories.length > 0 ? `
                <div class="categories">
                    <h3>Categories</h3>
                    <div class="category-tags">
                        ${safeCategories.map(category => `<span class="category-tag">${category}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Newsletter Content -->
                <div class="newsletter-content">
                    ${safeContent}
                </div>
                
                <div class="divider"></div>
                
                <!-- Thank You Section -->
                <div class="thank-you-section">
                    <p>Thank you for reading Newsletter Pro!</p>
                    <a href="${preferencesUrl}" class="cta-button">Manage Subscription</a>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p class="footer-brand">Newsletter Pro</p>
                <p class="footer-address">${safeCompanyAddress}</p>
                
                <div class="footer-links">
                    <a href="${preferencesUrl}">Update Preferences</a>
                    <a href="mailto:support@newsletterpro.com">Contact Support</a>
                    <a href="https://newsletterpro.com/privacy">Privacy Policy</a>
                    <a href="https://newsletterpro.com/terms">Terms of Service</a>
                </div>
                
                <div class="social-links">
                    <a href="https://facebook.com/newsletterpro" aria-label="Facebook">📘</a>
                    <a href="https://twitter.com/newsletterpro" aria-label="Twitter">🐦</a>
                    <a href="https://linkedin.com/company/newsletterpro" aria-label="LinkedIn">💼</a>
                    <a href="https://instagram.com/newsletterpro" aria-label="Instagram">📷</a>
                </div>
                
                <div class="unsubscribe">
                    <p>
                        You're receiving this email because you subscribed to Newsletter Pro.<br>
                        This newsletter was sent to: <strong>${safeEmail}</strong>
                    </p>
                    <p>
                        <a href="${unsubscribeUrl}">Unsubscribe</a> | 
                        <a href="${preferencesUrl}">Update Preferences</a>
                    </p>
                    <p>© ${new Date().getFullYear()} Newsletter Pro. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}



export function generateNewsletterText(data: NewsletterTemplateData): string {
  const {
    title,
    content,
    subscriberEmail,
    unsubscribeUrl,
    preferencesUrl,
    companyName = "Newsletter Pro",
    categories
  } = data;

  // For text emails, we don't need HTML escaping, just safe text content
  const safeTitle = title.replace(/[<>]/g, '');
  const safeContent = content.replace(/[<>]/g, '');
  const safeEmail = subscriberEmail.replace(/[<>]/g, '');
  const safeCompanyName = companyName.replace(/[<>]/g, '');
  const safeCategories = categories.map(cat => cat.replace(/[<>]/g, ''));

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `${currentDate}

NEWSLETTER PRO
Your daily dose of insights

TOGETHER WITH
Your Business Partner

${safeTitle}

${safeCategories.length > 0 ? `Categories: ${safeCategories.join(', ')}\n\n` : ''}${safeContent}

---

Thank you for reading Newsletter Pro!

Manage Subscription: ${preferencesUrl}

Update Preferences: ${preferencesUrl}
Contact Support: support@newsletterpro.com
Privacy Policy: https://newsletterpro.com/privacy
Terms of Service: https://newsletterpro.com/terms

Follow us:
Facebook: https://facebook.com/newsletterpro
Twitter: https://twitter.com/newsletterpro
LinkedIn: https://linkedin.com/company/newsletterpro
Instagram: https://instagram.com/newsletterpro

---

You're receiving this email because you subscribed to Newsletter Pro.
This newsletter was sent to: ${safeEmail}

Unsubscribe: ${unsubscribeUrl}
Update Preferences: ${preferencesUrl}

© ${new Date().getFullYear()} Newsletter Pro. All rights reserved.`;
}