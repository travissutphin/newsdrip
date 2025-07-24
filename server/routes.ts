import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSubscriberSchema, insertNewsletterSchema } from "@shared/schema";
import { sendEmail, sendNewsletterEmail } from "./services/emailService";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const subscriptionData = insertSubscriberSchema.extend({
        categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
      }).parse(req.body);

      const { categoryIds, ...subscriberData } = subscriptionData;

      // Create subscriber
      const subscriber = await storage.createSubscriber(subscriberData);

      // Set categories
      await storage.setSubscriberCategories(subscriber.id, categoryIds);

      res.json({ message: "Successfully subscribed!", subscriber });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Subscription failed" 
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
      });

      // Set categories
      await storage.setNewsletterCategories(newsletter.id, categoryIds);

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
        message: error instanceof Error ? error.message : "Failed to create newsletter" 
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
      });

      // Update categories if provided
      if (categoryIds) {
        await storage.setNewsletterCategories(id, categoryIds);
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
      await storage.deleteNewsletter(id);
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
            <p>Email: <strong>${subscriber.email || subscriber.phone}</strong></p>
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
              <strong>Subscriber:</strong> ${subscriber.email || subscriber.phone}<br>
              <strong>Contact Method:</strong> ${subscriber.contactMethod}<br>
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
                      ${category.name} ${category.description ? `- ${category.description}` : ''}
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
