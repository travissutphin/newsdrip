interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
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
