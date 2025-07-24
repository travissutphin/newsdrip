import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSubscriberSchema, insertNewsletterSchema } from "@shared/schema";
import { sendEmail } from "./services/emailService";
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
      
      // Get categories for each newsletter
      const newslettersWithCategories = await Promise.all(
        newsletters.map(async (newsletter) => {
          const categories = await storage.getNewsletterCategories(newsletter.id);
          return { ...newsletter, categories };
        })
      );

      res.json(newslettersWithCategories);
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
                const emailSent = await sendEmail({
                  to: subscriber.email,
                  subject: newsletter.subject || newsletter.title,
                  text: newsletter.content,
                  html: newsletter.htmlContent || `<p>${newsletter.content.replace(/\n/g, '<br>')}</p>`,
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
        } catch (deliveryError) {
          console.error('Mass delivery error:', deliveryError);
        }
      }

      res.json({ message: action === 'send' ? 'Newsletter sent!' : 'Newsletter saved!', newsletter });
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

  const httpServer = createServer(app);
  return httpServer;
}
