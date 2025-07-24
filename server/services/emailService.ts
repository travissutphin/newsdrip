import { generateNewsletterHTML, generateNewsletterText } from '../templates/newsletterTemplate.js';

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
}

export async function sendNewsletterEmail(params: NewsletterEmailParams): Promise<boolean> {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';
    
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${params.unsubscribeToken}`;
  const preferencesUrl = `${baseUrl}/api/preferences?token=${params.preferencesToken}`;

  const templateData = {
    title: params.title,
    content: params.content,
    subscriberEmail: params.to,
    unsubscribeUrl,
    preferencesUrl,
    categories: params.categories,
    companyName: "NewsletterPro",
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
