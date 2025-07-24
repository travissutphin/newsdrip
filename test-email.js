// Quick test to verify email functionality
import { sendEmail } from './server/services/emailService.ts';

async function testEmail() {
  try {
    const result = await sendEmail({
      to: 'travis.sutphin@gmail.com',
      subject: 'NewsletterPro Test Email',
      text: 'This is a test email from your newsletter platform to verify email delivery is working.',
      html: '<p>This is a test email from your newsletter platform to verify email delivery is working.</p><p>✅ If you receive this, email sending is configured correctly!</p>'
    });
    
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();