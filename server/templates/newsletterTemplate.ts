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

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Email-safe CSS */
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header .tagline {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1a202c;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
            line-height: 1.3;
        }
        .content p {
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 20px 0;
            color: #4a5568;
        }
        .content ul, .content ol {
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 20px 20px;
            color: #4a5568;
        }
        .content li {
            margin-bottom: 8px;
        }
        .categories {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 0 4px 4px 0;
        }
        .categories h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .category-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .category-tag {
            background-color: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
        }
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            font-size: 14px;
            color: #718096;
            margin: 0 0 16px 0;
        }
        .footer-links {
            margin: 20px 0;
        }
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            margin: 0 16px;
            font-weight: 500;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .social-links {
            margin: 24px 0 16px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #718096;
            text-decoration: none;
        }
        .unsubscribe {
            font-size: 12px;
            color: #a0aec0;
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #667eea;
            text-decoration: none;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: #1a202c;
            }
            .content p, .content ul, .content ol {
                color: #e2e8f0;
            }
            .content h2 {
                color: #f7fafc;
            }
            .categories {
                background-color: #2d3748;
            }
            .categories h3 {
                color: #e2e8f0;
            }
            .footer {
                background-color: #2d3748;
            }
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content h2 {
                font-size: 20px;
            }
            .category-tags {
                gap: 6px;
            }
            .footer-links a {
                display: block;
                margin: 8px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>${companyName}</h1>
            <p class="tagline">Your trusted newsletter source</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h2>${title}</h2>
            
            <!-- Categories -->
            <div class="categories">
                <h3>Newsletter Categories</h3>
                <div class="category-tags">
                    ${categories.map(category => `<span class="category-tag">${category}</span>`).join('')}
                </div>
            </div>
            
            <!-- Newsletter Content -->
            <div class="newsletter-content">
                ${formatContent(content)}
            </div>
            
            <div class="divider"></div>
            
            <!-- Call to Action (if needed) -->
            <div class="cta-section">
                <p style="margin-bottom: 16px;">Thank you for reading!</p>
                <a href="${preferencesUrl}" class="cta-button">Manage Preferences</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>${companyName}</strong></p>
            <p>${companyAddress}</p>
            
            <div class="footer-links">
                <a href="${preferencesUrl}">Update Preferences</a>
                <a href="mailto:support@example.com">Contact Support</a>
                <a href="https://example.com/privacy">Privacy Policy</a>
            </div>
            
            <div class="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="LinkedIn">💼</a>
                <a href="#" aria-label="Instagram">📷</a>
            </div>
            
            <div class="unsubscribe">
                <p>
                    You're receiving this email because you subscribed to our newsletter.<br>
                    This email was sent to: ${subscriberEmail}<br><br>
                    <a href="${unsubscribeUrl}">Unsubscribe</a> | 
                    <a href="${preferencesUrl}">Update Preferences</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function formatContent(content: string): string {
  // Convert plain text to HTML with proper formatting
  return content
    // Convert line breaks to paragraphs
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim() === '') return '';
      
      // Handle lists
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

export function generateNewsletterText(data: NewsletterTemplateData): string {
  const {
    title,
    content,
    subscriberEmail,
    unsubscribeUrl,
    preferencesUrl,
    companyName = "NewsletterPro",
    categories
  } = data;

  return `${companyName.toUpperCase()}
${title}

Categories: ${categories.join(', ')}

${content}

---

Thank you for reading!

Manage your preferences: ${preferencesUrl}

This email was sent to: ${subscriberEmail}
Unsubscribe: ${unsubscribeUrl}
Update Preferences: ${preferencesUrl}

© ${new Date().getFullYear()} ${companyName}`;
}