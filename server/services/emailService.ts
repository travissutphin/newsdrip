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

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend API error: ${response.statusText} - ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
