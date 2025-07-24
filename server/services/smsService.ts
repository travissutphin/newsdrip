export async function sendSMS(to: string, message: string): Promise<boolean> {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+15551234567';

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error("Twilio credentials not found. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.");
    throw new Error("SMS service not configured");
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Twilio API error: ${response.statusText} - ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}
