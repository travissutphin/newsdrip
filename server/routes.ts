import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSubscriberSchema, insertNewsletterSchema } from "@shared/schema";
import { sendEmail, sendNewsletterEmail, sendWelcomeEmail, sendPreferencesUpdatedEmail } from "./services/emailService";
import { createNewsletterHtmlPage, deleteNewsletterHtmlPage, updateNewsletterHtmlPage } from "./services/htmlPageService";
import { escapeHtml, getSafeErrorMessage } from "./utils/security";
import { z } from "zod";
import { nanoid } from "nanoid";
import type { Request } from "express";

// Rate limiting for subscription endpoint
const subscriptionAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3; // Max 3 attempts per IP per window

function getBaseUrl(req: Request): string {
  // Check for Replit deployment domains
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',');
    const primaryDomain = domains[0];
    return `https://${primaryDomain}`;
  }
  
  // Use request context if available
  if (req.get('host')) {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    return `${protocol}://${req.get('host')}`;
  }
  
  // Fallback for development
  return process.env.NODE_ENV === 'production' 
    ? 'https://your-app.replit.app' 
    : 'http://localhost:5000';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static newsletter HTML pages
  app.use('/newsletters', express.static('static/newsletters'));
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public subscription endpoint
  app.post('/api/subscribe', async (req, res) => {
    try {
      // Rate limiting check
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const attempts = subscriptionAttempts.get(clientIP);

      if (attempts) {
        // Clean up old attempts outside the window
        if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
          subscriptionAttempts.delete(clientIP);
        } else if (attempts.count >= MAX_ATTEMPTS) {
          return res.status(429).json({
            message: "Too many subscription attempts. Please try again later."
          });
        }
      }

      // Track this attempt
      const currentAttempts = attempts ? attempts.count + 1 : 1;
      subscriptionAttempts.set(clientIP, {
        count: currentAttempts,
        lastAttempt: now
      });
      const subscriptionData = insertSubscriberSchema.extend({
        categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
        website: z.string().optional(), // Honeypot field
        confirmSubscription: z.boolean().optional(), // Additional honeypot
        timestamp: z.number().optional(), // Timing validation
        submissionTime: z.number().optional(), // Time taken to submit
      }).parse(req.body);

      // Enhanced honeypot validation
      if (subscriptionData.website && subscriptionData.website.trim() !== '') {
        console.log(`Primary honeypot triggered for IP: ${clientIP}`);
        return res.status(400).json({
          message: "Invalid submission detected."
        });
      }

      // Additional honeypot validation  
      if (subscriptionData.confirmSubscription === true) {
        console.log(`Secondary honeypot triggered for IP: ${clientIP}`);
        return res.status(400).json({
          message: "Invalid submission detected."
        });
      }

      // Timing validation to detect bots
      if (subscriptionData.submissionTime) {
        const { isSuspiciousTiming } = await import('./utils/security');
        if (isSuspiciousTiming(subscriptionData.submissionTime)) {
          console.log(`Suspicious timing detected for IP: ${clientIP}, time: ${subscriptionData.submissionTime}ms`);
          return res.status(400).json({
            message: "Please take your time filling out the form."
          });
        }
      }

      const { categoryIds, website, confirmSubscription, timestamp, submissionTime, ...subscriberData } = subscriptionData;

      // Enhanced email validation
      if (subscriberData.email) {
        // Import spam detection functions
        const { isSpamEmail, hasValidDomain } = await import('./utils/security');
        
        // Check for spam patterns
        if (isSpamEmail(subscriberData.email)) {
          return res.status(400).json({
            message: "Please provide a valid email address."
          });
        }

        // Check for valid domain
        if (!hasValidDomain(subscriberData.email)) {
          return res.status(400).json({
            message: "Please check your email address and try again."
          });
        }

        // Check for disposable email domains
        const disposableEmailDomains = [
          '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
          'mailinator.com', 'temp-mail.org', 'yopmail.com', 'getnada.com',
          'throwaway.email', 'mohmal.com', 'sharklasers.com', 'guerrillamailblock.com'
        ];
        
        const emailDomain = subscriberData.email.split('@')[1]?.toLowerCase();
        if (disposableEmailDomains.includes(emailDomain)) {
          return res.status(400).json({
            message: "Disposable email addresses are not allowed."
          });
        }

        // Check for existing subscriber with same email
        const existingSubscribers = await storage.getSubscribers();
        const existingSubscriber = existingSubscribers.find(s => 
          s.email?.toLowerCase() === subscriberData.email?.toLowerCase()
        );
        
        if (existingSubscriber) {
          if (existingSubscriber.isActive) {
            return res.status(400).json({
              message: "This email is already subscribed to our newsletter."
            });
          } else {
            // Reactivate existing subscriber instead of creating new one
            await storage.updateSubscriber(existingSubscriber.id, { isActive: true });
            await storage.setSubscriberCategories(existingSubscriber.id, categoryIds);
            
            return res.json({
              message: "Welcome back! Your subscription has been reactivated.",
              subscriber: existingSubscriber
            });
          }
        }
      }

      // Create subscriber with tokens
      const subscriberWithTokens = {
        ...subscriberData,
        unsubscribeToken: nanoid(32),
        preferencesToken: nanoid(32),
      };
      
      const subscriber = await storage.createSubscriber(subscriberWithTokens);

      // Set categories
      await storage.setSubscriberCategories(subscriber.id, categoryIds);

      // Get categories for email
      const categories = await storage.getCategoriesByIds(categoryIds);
      
      // Send welcome email with preference management links
      try {
        const baseUrl = getBaseUrl(req);
        await sendWelcomeEmail({
          email: subscriber.email || subscriber.phone || '',
          preferencesUrl: `${baseUrl}/preferences?token=${subscriber.preferencesToken}`,
          unsubscribeUrl: `${baseUrl}/api/unsubscribe/${subscriber.unsubscribeToken}`,
          categories: categories.map(c => c.name),
          frequency: subscriber.frequency,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue anyway - subscription was successful
      }

      res.json({ message: "Successfully subscribed! Check your email for preference management options.", subscriber });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ 
        message: getSafeErrorMessage(process.env.NODE_ENV === 'development', error)
      });
    }
  });

  // Public categories endpoint
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Public preference management routes
  app.get('/api/preferences/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const subscriber = await storage.getSubscriberByPreferencesToken(token);
      if (!subscriber) {
        return res.status(404).json({ message: "Invalid or expired preferences link" });
      }

      // Get subscriber's categories
      const categories = await storage.getSubscriberCategories(subscriber.id);
      
      res.json({
        ...subscriber,
        categories: categories,
      });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put('/api/preferences/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const updateSchema = z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        contactMethod: z.enum(["email", "sms"]),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        categoryIds: z.array(z.number()).min(1),
        isActive: z.boolean(),
      }).refine((data) => {
        if (data.contactMethod === "email" && !data.email) {
          return false;
        }
        if (data.contactMethod === "sms" && !data.phone) {
          return false;
        }
        return true;
      });

      const updateData = updateSchema.parse(req.body);
      
      const subscriber = await storage.getSubscriberByPreferencesToken(token);
      if (!subscriber) {
        return res.status(404).json({ message: "Invalid or expired preferences link" });
      }

      // Update subscriber
      const updatedSubscriber = await storage.updateSubscriber(subscriber.id, updateData);
      
      // Update categories
      await storage.setSubscriberCategories(subscriber.id, updateData.categoryIds);
      
      // Get updated categories for email
      const categories = await storage.getCategoriesByIds(updateData.categoryIds);
      
      // Send confirmation email
      if (updateData.isActive && updateData.email) {
        try {
          const baseUrl = getBaseUrl(req);
          await sendPreferencesUpdatedEmail({
            email: updateData.email,
            preferencesUrl: `${baseUrl}/preferences?token=${subscriber.preferencesToken}`,
            unsubscribeUrl: `${baseUrl}/api/unsubscribe/${subscriber.unsubscribeToken}`,
            categories: categories.map(c => c.name),
            frequency: updateData.frequency,
            contactMethod: updateData.contactMethod,
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      res.json({ 
        message: "Preferences updated successfully!", 
        subscriber: updatedSubscriber 
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ 
        message: getSafeErrorMessage(process.env.NODE_ENV === 'development', error)
      });
    }
  });

  app.post('/api/unsubscribe/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const subscriber = await storage.getSubscriberByUnsubscribeToken(token);
      if (!subscriber) {
        return res.status(404).json({ message: "Invalid or expired unsubscribe link" });
      }

      // Deactivate subscriber and remove all category associations
      await storage.updateSubscriber(subscriber.id, { isActive: false });
      await storage.setSubscriberCategories(subscriber.id, []); // Remove all categories
      
      // Get updated subscriber data to return
      const updatedSubscriber = await storage.getSubscriber(subscriber.id);

      res.json({ 
        message: "Successfully unsubscribed from all newsletters",
        subscriber: updatedSubscriber
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  // Protected admin routes
  app.get('/api/admin/dashboard', isAuthenticated, async (req, res) => {
    try {
      const [subscriberStats, newsletterStats, deliveryStats] = await Promise.all([
        storage.getSubscriberStats(),
        storage.getNewsletterStats(),
        storage.getDeliveryStats(),
      ]);

      res.json({
        subscriberStats,
        newsletterStats,
        deliveryStats,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Newsletter management
  app.get('/api/admin/newsletters', isAuthenticated, async (req, res) => {
    try {
      const newsletters = await storage.getNewsletters();
      
      // Get categories and delivery stats for each newsletter
      const newslettersWithDetails = await Promise.all(
        newsletters.map(async (newsletter) => {
          const categories = await storage.getNewsletterCategories(newsletter.id);
          
          // Get delivery stats if newsletter was sent
          let deliveryStats = null;
          if (newsletter.status === 'sent') {
            const deliveries = await storage.getDeliveries();
            const newsletterDeliveries = deliveries.filter(d => d.newsletterId === newsletter.id);
            
            deliveryStats = {
              total: newsletterDeliveries.length,
              sent: newsletterDeliveries.filter(d => d.status === 'sent').length,
              failed: newsletterDeliveries.filter(d => d.status === 'failed').length,
              pending: newsletterDeliveries.filter(d => d.status === 'pending').length,
            };
          }
          
          return { ...newsletter, categories, deliveryStats };
        })
      );

      res.json(newslettersWithDetails);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post('/api/admin/newsletters', isAuthenticated, async (req: any, res) => {
    try {
      const newsletterData = insertNewsletterSchema.extend({
        categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
        action: z.enum(['draft', 'send']).optional(),
      }).parse(req.body);

      const { categoryIds, action, ...data } = newsletterData;
      const userId = req.user.claims.sub;

      // Create newsletter
      const newsletter = await storage.createNewsletter({
        ...data,
        authorId: userId,
        status: action === 'send' ? 'sent' : 'draft',
        sentAt: action === 'send' ? new Date() : undefined,
      });

      // Set categories
      await storage.setNewsletterCategories(newsletter.id, categoryIds);

      // Generate HTML page for the newsletter
      try {
        const categories = await storage.getCategoriesByIds(categoryIds);
        const htmlPageUrl = await createNewsletterHtmlPage({
          id: newsletter.id,
          title: newsletter.title,
          subject: newsletter.subject || newsletter.title,
          content: newsletter.content,
          categories: categories.map(c => c.name),
          createdAt: typeof newsletter.createdAt === 'string' ? newsletter.createdAt : new Date().toISOString(),
        });
        console.log(`Newsletter HTML page created: ${htmlPageUrl}`);
      } catch (htmlError) {
        console.error('Failed to create newsletter HTML page:', htmlError);
        // Continue with newsletter creation even if HTML page fails
      }

      // If sending, deliver to subscribers
      if (action === 'send') {
        try {
          const subscribers = await storage.getSubscribersByCategories(categoryIds);
          
          const deliveryPromises = subscribers.map(async (subscriber) => {
            const delivery = await storage.createDelivery({
              newsletterId: newsletter.id,
              subscriberId: subscriber.id,
              method: subscriber.contactMethod,
              status: 'pending',
            });

            try {
              if (subscriber.contactMethod === 'email' && subscriber.email) {
                // Get category names for this newsletter
                const newsletterCategories = await storage.getNewsletterCategories(newsletter.id);
                const categoryNames = newsletterCategories.map(c => c.name);
                
                const emailSent = await sendNewsletterEmail({
                  to: subscriber.email,
                  subject: newsletter.subject || newsletter.title,
                  title: newsletter.title,
                  content: newsletter.content,
                  categories: categoryNames,
                  unsubscribeToken: subscriber.unsubscribeToken || '',
                  preferencesToken: subscriber.preferencesToken || '',
                  newsletterId: newsletter.id,
                });
                
                if (emailSent) {
                  await storage.updateDeliveryStatus(delivery.id, 'sent');
                } else {
                  // Email service returned false (e.g., domain verification needed)
                  await storage.updateDeliveryStatus(delivery.id, 'pending');
                  console.log(`Email to ${subscriber.email} marked as pending due to Resend limitations`);
                }
              } else if (subscriber.contactMethod === 'sms' && subscriber.phone) {
                // SMS service not configured yet, mark as pending
                await storage.updateDeliveryStatus(delivery.id, 'pending');
              }
            } catch (deliveryError) {
              console.error('Delivery failed:', deliveryError);
              await storage.updateDeliveryStatus(delivery.id, 'failed');
            }
          });

          await Promise.all(deliveryPromises);
          
          // Get final delivery stats for response
          const deliveries = await storage.getDeliveries();
          const newsletterDeliveries = deliveries.filter(d => d.newsletterId === newsletter.id);
          const deliveryStats = {
            total: newsletterDeliveries.length,
            sent: newsletterDeliveries.filter(d => d.status === 'sent').length,
            failed: newsletterDeliveries.filter(d => d.status === 'failed').length,
            pending: newsletterDeliveries.filter(d => d.status === 'pending').length,
          };
          
          res.json({ 
            message: `Newsletter sent to ${deliveryStats.total} subscribers! (${deliveryStats.sent} delivered, ${deliveryStats.pending} pending, ${deliveryStats.failed} failed)`,
            newsletter,
            deliveryStats
          });
        } catch (deliveryError) {
          console.error('Mass delivery error:', deliveryError);
          res.status(500).json({ message: "Failed to deliver newsletter" });
        }
      } else {
        res.json({ message: 'Newsletter saved as draft!', newsletter });
      }
    } catch (error) {
      console.error("Newsletter creation error:", error);
      res.status(400).json({ 
        message: getSafeErrorMessage(process.env.NODE_ENV === 'development', error)
      });
    }
  });

  app.put('/api/admin/newsletters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const newsletterData = insertNewsletterSchema.extend({
        categoryIds: z.array(z.number()).optional(),
        action: z.enum(['draft', 'send']).optional(),
      }).partial().parse(req.body);

      const { categoryIds, action, ...data } = newsletterData;

      // Update newsletter
      const newsletter = await storage.updateNewsletter(id, {
        ...data,
        status: action === 'send' ? 'sent' : data.status,
        sentAt: action === 'send' ? new Date() : data.sentAt,
      });

      // Update categories if provided
      if (categoryIds) {
        await storage.setNewsletterCategories(id, categoryIds);
      }

      // Update HTML page if newsletter content changed
      if (data.title || data.content) {
        try {
          const fullNewsletter = await storage.getNewsletter(id);
          if (fullNewsletter) {
            const categories = categoryIds 
              ? await storage.getCategoriesByIds(categoryIds)
              : await storage.getNewsletterCategories(id);
            
            await updateNewsletterHtmlPage({
              id: fullNewsletter.id,
              title: fullNewsletter.title,
              subject: fullNewsletter.subject || fullNewsletter.title,
              content: fullNewsletter.content,
              categories: categories.map(c => c.name),
              createdAt: typeof fullNewsletter.createdAt === 'string' ? fullNewsletter.createdAt : new Date().toISOString(),
            });
          }
        } catch (htmlError) {
          console.error('Failed to update newsletter HTML page:', htmlError);
          // Continue with newsletter update even if HTML page fails
        }
      }

      res.json({ message: 'Newsletter updated!', newsletter });
    } catch (error) {
      console.error("Newsletter update error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to update newsletter" 
      });
    }
  });

  app.delete('/api/admin/newsletters/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get newsletter data before deletion for HTML page cleanup
      const newsletter = await storage.getNewsletter(id);
      
      await storage.deleteNewsletter(id);
      
      // Clean up HTML page
      if (newsletter) {
        try {
          await deleteNewsletterHtmlPage(newsletter.id, newsletter.title);
        } catch (htmlError) {
          console.error('Failed to delete newsletter HTML page:', htmlError);
          // Continue with deletion even if HTML cleanup fails
        }
      }
      
      res.json({ message: 'Newsletter deleted!' });
    } catch (error) {
      console.error("Newsletter deletion error:", error);
      res.status(500).json({ message: "Failed to delete newsletter" });
    }
  });

  // Subscriber management
  app.get('/api/admin/subscribers', isAuthenticated, async (req, res) => {
    try {
      const subscribers = await storage.getSubscribers();
      
      // Get categories for each subscriber
      const subscribersWithCategories = await Promise.all(
        subscribers.map(async (subscriber) => {
          const categories = await storage.getSubscriberCategories(subscriber.id);
          return { ...subscriber, categories };
        })
      );

      res.json(subscribersWithCategories);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  app.put('/api/admin/subscribers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscriberData = insertSubscriberSchema.extend({
        categoryIds: z.array(z.number()).optional(),
      }).partial().parse(req.body);

      const { categoryIds, ...data } = subscriberData;

      // Update subscriber
      const subscriber = await storage.updateSubscriber(id, data);

      // Update categories if provided
      if (categoryIds) {
        await storage.setSubscriberCategories(id, categoryIds);
      }

      res.json({ message: 'Subscriber updated!', subscriber });
    } catch (error) {
      console.error("Subscriber update error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to update subscriber" 
      });
    }
  });

  app.delete('/api/admin/subscribers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubscriber(id);
      res.json({ message: 'Subscriber removed!' });
    } catch (error) {
      console.error("Subscriber deletion error:", error);
      res.status(500).json({ message: "Failed to remove subscriber" });
    }
  });

  // Analytics
  app.get('/api/admin/analytics', isAuthenticated, async (req, res) => {
    try {
      const [deliveries, categories] = await Promise.all([
        storage.getDeliveries(),
        storage.getCategories(),
      ]);

      res.json({ deliveries, categories });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Unsubscribe endpoint
  app.get('/api/unsubscribe', async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h2 style="color: #dc3545;">Invalid Unsubscribe Link</h2>
              <p>This unsubscribe link is invalid or has expired.</p>
              <p>Please contact support if you continue to receive unwanted emails.</p>
            </body>
          </html>
        `);
      }

      // Find subscriber by token
      const subscribers = await storage.getSubscribers();
      const subscriber = subscribers.find(s => s.unsubscribeToken === token);
      
      if (!subscriber) {
        return res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h2 style="color: #dc3545;">Subscriber Not Found</h2>
              <p>We couldn't find a subscription associated with this link.</p>
              <p>You may have already unsubscribed, or the link may be invalid.</p>
            </body>
          </html>
        `);
      }

      // Deactivate subscriber
      await storage.updateSubscriber(subscriber.id, { isActive: false });

      res.send(`
        <html>
          <head>
            <title>Unsubscribed Successfully</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .success { color: #28a745; }
              .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h2 class="success">✓ Successfully Unsubscribed</h2>
            <p>You have been unsubscribed from our newsletter.</p>
            <p>Email: <strong>${escapeHtml(subscriber.email || subscriber.phone || '')}</strong></p>
            <p>We're sorry to see you go! You will no longer receive newsletters from us.</p>
            <p>If this was a mistake, you can always subscribe again on our website.</p>
            <a href="/" class="button">Return to Website</a>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h2 style="color: #dc3545;">Error</h2>
            <p>An error occurred while processing your unsubscribe request.</p>
            <p>Please try again later or contact support.</p>
          </body>
        </html>
      `);
    }
  });

  // Newsletter archive page
  app.get('/api/newsletters/archive', async (req, res) => {
    try {
      const newsletters = await storage.getPublishedNewsletters();
      
      const newslettersWithDetails = await Promise.all(
        newsletters.map(async (newsletter) => {
          const categories = await storage.getNewsletterCategories(newsletter.id);
          
          // Generate slug for URL
          const slug = newsletter.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          
          return {
            id: newsletter.id,
            title: newsletter.title,
            subject: newsletter.subject,
            excerpt: newsletter.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
            categories: categories.map(c => c.name),
            createdAt: newsletter.createdAt,
            htmlUrl: `/newsletters/${slug}-${newsletter.id}.html`
          };
        })
      );

      res.json(newslettersWithDetails);
    } catch (error) {
      console.error("Error fetching newsletter archive:", error);
      res.status(500).json({ message: "Failed to fetch newsletter archive" });
    }
  });

  // Preferences endpoint
  app.get('/api/preferences', async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h2 style="color: #dc3545;">Invalid Preferences Link</h2>
              <p>This preferences link is invalid or has expired.</p>
            </body>
          </html>
        `);
      }

      // Find subscriber by token
      const subscribers = await storage.getSubscribers();
      const subscriber = subscribers.find(s => s.preferencesToken === token);
      
      if (!subscriber) {
        return res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h2 style="color: #dc3545;">Subscriber Not Found</h2>
              <p>We couldn't find a subscription associated with this link.</p>
            </body>
          </html>
        `);
      }

      // Get current categories and all available categories
      const [subscriberCategories, allCategories] = await Promise.all([
        storage.getSubscriberCategories(subscriber.id),
        storage.getCategories(),
      ]);

      res.send(`
        <html>
          <head>
            <title>Newsletter Preferences</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .form-group { margin: 20px 0; }
              label { display: block; margin: 10px 0 5px 0; font-weight: bold; }
              input, select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
              .checkbox-group { margin: 10px 0; }
              .checkbox-group input { width: auto; margin-right: 8px; }
              .button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
              .button:hover { background: #0056b3; }
              .success { color: #28a745; background: #d4edda; padding: 10px; border-radius: 4px; margin: 20px 0; }
              .info { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h2>📧 Newsletter Preferences</h2>
            <div class="info">
              <strong>Subscriber:</strong> ${escapeHtml(subscriber.email || subscriber.phone || '')}<br>
              <strong>Contact Method:</strong> ${escapeHtml(subscriber.contactMethod)}<br>
              <strong>Status:</strong> ${subscriber.isActive ? 'Active' : 'Inactive'}
            </div>
            
            <form method="POST" action="/api/preferences">
              <input type="hidden" name="token" value="${token}">
              
              <div class="form-group">
                <label for="frequency">Delivery Frequency:</label>
                <select name="frequency" id="frequency">
                  <option value="daily" ${subscriber.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                  <option value="weekly" ${subscriber.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                  <option value="monthly" ${subscriber.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
              </div>

              <div class="form-group">
                <label>Newsletter Categories:</label>
                ${allCategories.map(category => `
                  <div class="checkbox-group">
                    <input type="checkbox" name="categories" value="${category.id}" id="cat-${category.id}" 
                           ${subscriberCategories.some(sc => sc.id === category.id) ? 'checked' : ''}>
                    <label for="cat-${category.id}" style="display: inline; font-weight: normal;">
                      ${escapeHtml(category.name)} ${category.description ? `- ${escapeHtml(category.description)}` : ''}
                    </label>
                  </div>
                `).join('')}
              </div>

              <div class="form-group">
                <button type="submit" class="button">Save Preferences</button>
                <br><br>
                <a href="/api/unsubscribe?token=${subscriber.unsubscribeToken}" 
                   onclick="return confirm('Are you sure you want to unsubscribe from all newsletters?')"
                   style="color: #dc3545; text-decoration: none;">Unsubscribe from all newsletters</a>
              </div>
            </form>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Preferences error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h2 style="color: #dc3545;">Error</h2>
            <p>An error occurred while loading your preferences.</p>
            <p>Please try again later or contact support.</p>
          </body>
        </html>
      `);
    }
  });

  // Update preferences endpoint  
  app.post('/api/preferences', async (req, res) => {
    try {
      const { token, frequency, categories } = req.body;
      
      if (!token) {
        return res.status(400).send('Invalid token');
      }

      // Find subscriber by token
      const subscribers = await storage.getSubscribers();
      const subscriber = subscribers.find(s => s.preferencesToken === token);
      
      if (!subscriber) {
        return res.status(404).send('Subscriber not found');
      }

      // Update subscriber frequency
      await storage.updateSubscriber(subscriber.id, { frequency });

      // Update categories
      const categoryIds = Array.isArray(categories) 
        ? categories.map(id => parseInt(id)) 
        : categories ? [parseInt(categories)] : [];
      
      await storage.setSubscriberCategories(subscriber.id, categoryIds);

      res.redirect(`/api/preferences?token=${token}&updated=1`);
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).send('Error updating preferences');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
