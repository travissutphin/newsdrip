
import { escapeHtml, sanitizeHtmlContent } from '../utils/security';

interface NewsletterPageData {
  id: number;
  title: string;
  subject: string;
  content: string;
  categories: string[];
  createdAt: string;
  excerpt?: string;
}

export function generateNewsletterHtmlPage(data: NewsletterPageData): string {
  const {
    id,
    title,
    subject,
    content,
    categories,
    createdAt,
    excerpt
  } = data;

  // Sanitize all input data
  const safeTitle = escapeHtml(title);
  const safeSubject = escapeHtml(subject);
  const safeContent = sanitizeHtmlContent(content); // Use HTML sanitizer for rich content
  const safeCategories = categories.map(cat => escapeHtml(cat));
  
  // Generate excerpt from content if not provided
  const safeExcerpt = excerpt 
    ? escapeHtml(excerpt)
    : escapeHtml(content.replace(/<[^>]*>/g, '').substring(0, 160) + '...');

  // Format date for display
  const publishDate = new Date(createdAt);
  const formattedDate = publishDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const isoDate = publishDate.toISOString();

  // Generate slug for URL
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} | NewsDrip Newsletter</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="${safeExcerpt}">
    <meta name="keywords" content="${safeCategories.join(', ')}, newsletter, news, updates">
    <meta name="author" content="NewsDrip">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="/newsletters/${slug}-${id}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeExcerpt}">
    <meta property="og:url" content="/newsletters/${slug}-${id}">
    <meta property="og:site_name" content="NewsDrip">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:author" content="NewsDrip">
    <meta property="article:section" content="Newsletter">
    ${safeCategories.map(cat => `<meta property="article:tag" content="${cat}">`).join('\n    ')}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeExcerpt}">
    <meta name="twitter:site" content="@newsdrip">
    <meta name="twitter:creator" content="@newsdrip">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${safeTitle.replace(/"/g, '\\"')}",
      "description": "${safeExcerpt.replace(/"/g, '\\"')}",
      "datePublished": "${isoDate}",
      "dateModified": "${isoDate}",
      "author": {
        "@type": "Organization",
        "name": "NewsDrip",
        "url": "/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "NewsDrip",
        "logo": {
          "@type": "ImageObject",
          "url": "/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "/newsletters/${slug}-${id}"
      },
      "articleSection": "${safeCategories.join(', ')}",
      "keywords": "${safeCategories.join(', ')}"
    }
    </script>
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" href="/favicon.png">
    
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #f8fafc;
            background-color: #334155;
            min-height: 100vh;
        }
        
        /* Container */
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #475569;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            min-height: 100vh;
            border-radius: 12px;
            overflow: hidden;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #475569 0%, #334155 100%);
            color: #f8fafc;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
            border-bottom: 2px solid #ef4444;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(239,68,68,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .brand-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }
        
        .lightning-icon {
            width: 32px;
            height: 32px;
            margin-right: 12px;
        }
        
        .brand-name {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -1px;
        }
        
        .tagline {
            font-size: 1rem;
            opacity: 0.9;
            font-weight: 500;
            margin-bottom: 1rem;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 1rem 0;
            line-height: 1.2;
        }
        
        .meta {
            font-size: 1rem;
            opacity: 0.8;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        /* Categories */
        .categories {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 1rem;
        }
        
        .category-tag {
            background-color: #ef4444;
            color: #f8fafc;
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Content */
        .content {
            padding: 3rem 2rem;
            background-color: #475569;
        }
        
        .content h1 {
            color: #ef4444;
            font-size: 2rem;
            font-weight: 700;
            margin: 2rem 0 1rem 0;
            line-height: 1.3;
        }
        
        .content h2 {
            color: #ef4444;
            font-size: 1.75rem;
            font-weight: 700;
            margin: 2rem 0 1rem 0;
            line-height: 1.3;
        }
        
        .content h3 {
            color: #f8fafc;
            font-size: 1.375rem;
            font-weight: 600;
            margin: 1.5rem 0 0.75rem 0;
            line-height: 1.4;
        }
        
        .content h4, .content h5, .content h6 {
            color: #e2e8f0;
            font-weight: 600;
            margin: 1rem 0 0.5rem 0;
            line-height: 1.4;
        }
        
        .content p {
            font-size: 1.125rem;
            line-height: 1.75;
            margin: 0 0 1.25rem 0;
            color: #e2e8f0;
        }
        
        .content ul, .content ol {
            font-size: 1.125rem;
            line-height: 1.75;
            margin: 0 0 1.25rem 2rem;
            color: #e2e8f0;
        }
        
        .content li {
            margin-bottom: 0.5rem;
        }
        
        .content a {
            color: #ef4444;
            text-decoration: underline;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .content a:hover {
            color: #dc2626;
            text-decoration: none;
        }
        
        .content blockquote {
            border-left: 4px solid #ef4444;
            padding: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: #cbd5e1;
            background-color: #334155;
            border-radius: 6px;
        }
        
        .content strong, .content b {
            color: #f8fafc;
            font-weight: 700;
        }
        
        .content em, .content i {
            color: #e2e8f0;
            font-style: italic;
        }
        
        .content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1.5rem 0;
        }
        
        /* Subscription CTA */
        .subscription-cta {
            background: linear-gradient(135deg, #334155 0%, #475569 100%);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            margin: 3rem 0;
            border: 2px solid #ef4444;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        .subscription-cta h3 {
            color: #f8fafc;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
        }
        
        .subscription-cta p {
            color: #e2e8f0;
            margin: 0 0 1.5rem 0;
            font-size: 1rem;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 1rem;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }
        
        /* Footer */
        .footer {
            background-color: #334155;
            color: #cbd5e1;
            padding: 2rem;
            text-align: center;
            border-top: 1px solid #64748b;
        }
        
        .footer p {
            margin: 0.5rem 0;
            font-size: 0.875rem;
        }
        
        .footer a {
            color: #ef4444;
            text-decoration: none;
            transition: color 0.2s;
        }
        
        .footer a:hover {
            color: #f87171;
            text-decoration: underline;
        }
        
        .footer a {
            color: #ef4444;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .header {
                padding: 2rem 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .brand-name {
                font-size: 1.5rem;
            }
            
            .content {
                padding: 2rem 1rem;
            }
            
            .content h2 {
                font-size: 1.5rem;
            }
            
            .content p, .content ul, .content ol {
                font-size: 1rem;
            }
            
            .subscription-cta {
                padding: 1.5rem;
                margin: 2rem 0;
            }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
            .cta-button {
                transition: none;
            }
            
            .cta-button:hover {
                transform: none;
            }
        }
        
        /* Print styles */
        @media print {
            .subscription-cta,
            .footer {
                display: none;
            }
            
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <article class="container" itemscope itemtype="https://schema.org/NewsArticle">
        <header class="header">
            <div class="header-content">
                <div class="brand-logo">
                    <svg class="lightning-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M13 2L3 14h6l-2 8 10-12h-6l2-8z"/>
                    </svg>
                    <div class="brand-name">NewsDrip</div>
                </div>
                <p class="tagline">The Gist. No Fluff.</p>
                
                <h1 itemprop="headline">${safeTitle}</h1>
                
                <div class="meta">
                    <time datetime="${isoDate}" itemprop="datePublished">Published on ${formattedDate}</time>
                    <span itemprop="author" itemscope itemtype="https://schema.org/Organization">
                        <meta itemprop="name" content="NewsDrip">
                        by NewsDrip
                    </span>
                </div>
                
                ${safeCategories.length > 0 ? `
                <div class="categories" role="list" aria-label="Article categories">
                    ${safeCategories.map(category => `
                        <span class="category-tag" role="listitem" itemprop="articleSection">${category}</span>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </header>
        
        <main class="content">
            <div itemprop="articleBody">
                ${safeContent}
            </div>
            
            <div class="subscription-cta" role="complementary" aria-labelledby="subscribe-heading">
                <h3 id="subscribe-heading">Enjoyed this newsletter?</h3>
                <p>Get the latest updates delivered directly to your inbox.</p>
                <a href="/" class="cta-button" role="button">Subscribe Now</a>
            </div>
        </main>
        
        <footer class="footer" role="contentinfo">
            <p>&copy; ${new Date().getFullYear()} NewsDrip. All rights reserved.</p>
            <p>
                <a href="/">Home</a> | 
                <a href="/newsletters">Newsletter Archive</a> | 
                <a href="/privacy">Privacy Policy</a> | 
                <a href="/terms">Terms of Service</a>
            </p>
        </footer>
        
        <!-- Hidden structured data -->
        <meta itemprop="description" content="${safeExcerpt}">
        <meta itemprop="dateModified" content="${isoDate}">
        <div itemprop="publisher" itemscope itemtype="https://schema.org/Organization" style="display: none;">
            <meta itemprop="name" content="NewsDrip">
            <div itemprop="logo" itemscope itemtype="https://schema.org/ImageObject">
                <meta itemprop="url" content="/logo.png">
            </div>
        </div>
    </article>
</body>
</html>`;
}
