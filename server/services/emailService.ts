import { generateNewsletterHTML, generateNewsletterText } from '../templates/newsletterTemplate.js';
import { 
  generateWelcomeEmail, 
  generatePreferencesUpdatedEmail,
  type WelcomeEmailData,
  type PreferencesUpdatedEmailData
} from '../templates/preferencesEmailTemplate.js';

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface NewsletterEmailParams {
  to: string;
  subject: string;
  title: string;
  content: string;
  categories: string[];
  unsubscribeToken: string;
  preferencesToken: string;
  newsletterId: number;
}

export async function sendNewsletterEmail(params: NewsletterEmailParams): Promise<boolean> {
  const baseUrl = getBaseUrl();
    
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${params.unsubscribeToken}`;
  const preferencesUrl = `${baseUrl}/preferences?token=${params.preferencesToken}`;
  
  // Generate the newsletter HTML page URL
  const slug = params.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  const viewOnlineUrl = `${baseUrl}/newsletters/${slug}-${params.newsletterId}.html`;

  const templateData = {
    title: params.title,
    content: params.content,
    subscriberEmail: params.to,
    unsubscribeUrl,
    preferencesUrl,
    viewOnlineUrl,
    categories: params.categories,
    companyName: "NewsDrip",
    companyAddress: "Built with ❤️ on Replit"
  };

  const htmlContent = generateNewsletterHTML(templateData);
  const textContent = generateNewsletterText(templateData);

  return sendEmail({
    to: params.to,
    subject: params.subject,
    html: htmlContent,
    text: textContent
  });
}

function getBaseUrl(): string {
  // Check for Replit deployment domains
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',');
    const primaryDomain = domains[0];
    return `https://${primaryDomain}`;
  }
  
  // Fallback for development
  return process.env.NODE_ENV === 'production' 
    ? 'https://your-app.replit.app' 
    : 'http://localhost:5000';
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const emailContent = generateWelcomeEmail(data);
  
  return sendEmail({
    to: data.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
}

export async function sendPreferencesUpdatedEmail(data: PreferencesUpdatedEmailData): Promise<boolean> {
  const emailContent = generatePreferencesUpdatedEmail(data);
  
  return sendEmail({
    to: data.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error("No Resend API key found. Set RESEND_API_KEY environment variable.");
    throw new Error("Email service not configured");
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NewsletterPro <onboarding@resend.dev>',
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    const responseData = await response.text();
    
    if (!response.ok) {
      // Check if it's a domain verification error
      if (response.status === 403 && responseData.includes('verify a domain')) {
        console.warn(`Resend domain verification required. Email to ${params.to} was not sent.`);
        console.warn('To send emails to external recipients, verify a domain at resend.com/domains');
        // Don't throw an error for domain verification issues in test mode
        return false;
      }
      throw new Error(`Resend API error: ${response.statusText} - ${responseData}`);
    }

    console.log(`Email sent successfully to ${params.to}:`, responseData);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
