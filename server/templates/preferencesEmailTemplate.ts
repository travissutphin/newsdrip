import { escapeHtml } from "../utils/security";

export interface PreferencesEmailData {
  email: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  categories: string[];
  frequency: string;
}

export interface WelcomeEmailData {
  email: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  categories: string[];
  frequency: string;
}

export interface PreferencesUpdatedEmailData {
  email: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  categories: string[];
  frequency: string;
  contactMethod: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): { subject: string; html: string; text: string } {
  const safeEmail = escapeHtml(data.email);
  const safeCategories = data.categories.map(escapeHtml).join(", ");
  const safeFrequency = escapeHtml(data.frequency);

  const subject = "Welcome to NewsDrip! ⚡";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NewsDrip</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #f8fafc;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #334155;
        }
        .container {
            background: #475569;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .lightning-icon {
            display: inline-block;
            width: 36px;
            height: 36px;
            margin-right: 8px;
            vertical-align: middle;
            background-color: #ef4444;
            border-radius: 50%;
            padding: 8px;
            fill: white;
        }
        .content {
            padding: 30px;
            color: #e2e8f0;
        }
        .highlight-box {
            background: #334155;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .button {
            display: inline-block;
            background: #ef4444;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
            text-align: center;
        }
        .button:hover {
            background: #dc2626;
        }
        .button.secondary {
            background: #64748b;
        }
        .button.secondary:hover {
            background: #475569;
        }
        .footer {
            background: #334155;
            padding: 20px;
            text-align: center;
            color: #cbd5e1;
            font-size: 14px;
        }
        .footer a {
            color: #ef4444;
            text-decoration: none;
        }
        .preferences-summary {
            background: #334155;
            border: 1px solid #64748b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .emoji {
            font-size: 24px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <svg class="lightning-icon" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h6l-2 8 10-12h-6l2-8z"/>
            </svg>
            <h1>Welcome to NewsDrip!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">The Gist. No Fluff.</p>
        </div>
        
        <div class="content">
            <h2 style="color: #f8fafc; margin-top: 0;">Hi there! ⚡</h2>
            
            <p>Welcome to the NewsDrip community! We're thrilled to have you on board and ready to deliver the news that matters, fast.</p>
            
            <div class="preferences-summary">
                <h3 style="margin-top: 0; color: #ef4444;">⚡ Your Subscription Details</h3>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Frequency:</strong> ${safeFrequency}</p>
                <p><strong>Categories:</strong> ${safeCategories}</p>
            </div>
            
            <p>You'll start receiving NewsDrip newsletters based on your selected preferences. Here's what you can expect:</p>
            
            <ul style="color: #e2e8f0;">
                <li>⚡ Lightning-fast breaking news and insights</li>
                <li>🎯 No fluff - only essential information</li>
                <li>📰 Curated quality content without clickbait</li>
                <li>⚙️ Easy preference management anytime</li>
                <li>🚫 One-click unsubscribe option</li>
            </ul>
            
            <div class="highlight-box">
                <h3 style="margin-top: 0; color: #ef4444;">⚡ Manage Your Preferences</h3>
                <p>Want to update your subscription settings? You can modify your preferences, change your email frequency, or update your categories anytime.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${data.preferencesUrl}" class="button">
                        Manage Preferences
                    </a>
                </div>
            </div>
            
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            
            <p style="margin-bottom: 0;">
                Best regards,<br>
                <strong>The NewsDrip Team</strong><br>
                <em>The Gist. No Fluff.</em>
            </p>
        </div>
        
        <div class="footer">
            <p>
                <a href="${data.preferencesUrl}">Update Preferences</a> | 
                <a href="${data.unsubscribeUrl}">Unsubscribe</a>
            </p>
            <p style="margin: 10px 0 0 0;">
                © 2025 NewsDrip. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Welcome to NewsletterPro! 🎉

Hi there!

Welcome to the NewsletterPro community! We're thrilled to have you on board.

Your Subscription Details:
- Email: ${data.email}
- Frequency: ${data.frequency}
- Categories: ${data.categories.join(", ")}

You'll start receiving newsletters based on your selected preferences. Here's what you can expect:

• High-quality content tailored to your interests
• No spam - only valuable updates  
• Easy preference management anytime
• One-click unsubscribe option

Manage Your Preferences:
You can modify your subscription settings, change your email frequency, or update your categories anytime at:
${data.preferencesUrl}

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
The NewsletterPro Team

---
Update Preferences: ${data.preferencesUrl}
Unsubscribe: ${data.unsubscribeUrl}

© 2025 NewsletterPro. All rights reserved.
`;

  return { subject, html, text };
}

export function generatePreferencesUpdatedEmail(data: PreferencesUpdatedEmailData): { subject: string; html: string; text: string } {
  const safeEmail = escapeHtml(data.email);
  const safeCategories = data.categories.map(escapeHtml).join(", ");
  const safeFrequency = escapeHtml(data.frequency);
  const safeContactMethod = escapeHtml(data.contactMethod);

  const subject = "Your newsletter preferences have been updated";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preferences Updated</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .preferences-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .emoji {
            font-size: 24px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">✅</div>
            <h1>Preferences Updated Successfully</h1>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Changes Confirmed</h2>
            
            <p>Your newsletter subscription preferences have been successfully updated. Here are your current settings:</p>
            
            <div class="preferences-box">
                <h3 style="margin-top: 0; color: #0369a1;">📋 Current Preferences</h3>
                <p><strong>Contact Method:</strong> ${safeContactMethod === 'email' ? '📧 Email' : '📱 SMS'}</p>
                <p><strong>Contact:</strong> ${safeEmail}</p>
                <p><strong>Frequency:</strong> ${safeFrequency}</p>
                <p><strong>Categories:</strong> ${safeCategories}</p>
            </div>
            
            <p>Your new preferences will take effect immediately. You'll receive future newsletters according to these updated settings.</p>
            
            <p>Need to make more changes? You can update your preferences anytime using the link below:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${data.preferencesUrl}" class="button">
                    Manage Preferences
                </a>
            </div>
            
            <p style="margin-bottom: 0;">
                Thank you for staying connected with us!<br>
                <strong>The NewsletterPro Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>
                <a href="${data.preferencesUrl}">Update Preferences</a> | 
                <a href="${data.unsubscribeUrl}">Unsubscribe</a>
            </p>
            <p style="margin: 10px 0 0 0;">
                © 2025 NewsletterPro. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Preferences Updated Successfully ✅

Your newsletter subscription preferences have been successfully updated.

Current Preferences:
- Contact Method: ${data.contactMethod === 'email' ? 'Email' : 'SMS'}
- Contact: ${data.email}
- Frequency: ${data.frequency}
- Categories: ${data.categories.join(", ")}

Your new preferences will take effect immediately. You'll receive future newsletters according to these updated settings.

Need to make more changes? You can update your preferences anytime at:
${data.preferencesUrl}

Thank you for staying connected with us!
The NewsletterPro Team

---
Update Preferences: ${data.preferencesUrl}
Unsubscribe: ${data.unsubscribeUrl}

© 2025 NewsletterPro. All rights reserved.
`;

  return { subject, html, text };
}

export function generatePreferencesReminderEmail(data: PreferencesEmailData): { subject: string; html: string; text: string } {
  const safeEmail = escapeHtml(data.email);
  const safeCategories = data.categories.map(escapeHtml).join(", ");
  const safeFrequency = escapeHtml(data.frequency);

  const subject = "📬 Manage your newsletter preferences";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Your Preferences</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .preferences-box {
            background: #fefce8;
            border: 1px solid #fde047;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .emoji {
            font-size: 24px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">📬</div>
            <h1>Manage Your Newsletter Preferences</h1>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Stay in Control</h2>
            
            <p>We want to make sure you're getting exactly the content you want. Take a moment to review and update your newsletter preferences.</p>
            
            <div class="preferences-box">
                <h3 style="margin-top: 0; color: #a16207;">📋 Your Current Settings</h3>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Frequency:</strong> ${safeFrequency}</p>
                <p><strong>Categories:</strong> ${safeCategories}</p>
            </div>
            
            <p>Want to make changes? You can:</p>
            
            <ul style="color: #4b5563;">
                <li>🔄 Change your email frequency</li>
                <li>🏷️ Update your topic preferences</li>
                <li>📧 Modify your contact information</li>
                <li>⏸️ Pause your subscription temporarily</li>
                <li>🚫 Unsubscribe completely</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${data.preferencesUrl}" class="button">
                    Update My Preferences
                </a>
            </div>
            
            <p>It only takes a minute to customize your experience!</p>
            
            <p style="margin-bottom: 0;">
                Best regards,<br>
                <strong>The NewsletterPro Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>
                <a href="${data.preferencesUrl}">Update Preferences</a> | 
                <a href="${data.unsubscribeUrl}">Unsubscribe</a>
            </p>
            <p style="margin: 10px 0 0 0;">
                © 2025 NewsletterPro. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Manage Your Newsletter Preferences 📬

We want to make sure you're getting exactly the content you want. Take a moment to review and update your newsletter preferences.

Your Current Settings:
- Email: ${data.email}
- Frequency: ${data.frequency}
- Categories: ${data.categories.join(", ")}

Want to make changes? You can:
• Change your email frequency
• Update your topic preferences
• Modify your contact information
• Pause your subscription temporarily
• Unsubscribe completely

Update your preferences at:
${data.preferencesUrl}

It only takes a minute to customize your experience!

Best regards,
The NewsletterPro Team

---
Update Preferences: ${data.preferencesUrl}
Unsubscribe: ${data.unsubscribeUrl}

© 2025 NewsletterPro. All rights reserved.
`;

  return { subject, html, text };
}