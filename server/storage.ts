import {
  users,
  categories,
  subscribers,
  newsletters,
  subscriberCategories,
  newsletterCategories,
  deliveries,
  type User,
  type UpsertUser,
  type Category,
  type Subscriber,
  type InsertSubscriber,
  type Newsletter,
  type InsertNewsletter,
  type Delivery,
  type SubscriberCategory,
  type NewsletterCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  
  // Subscriber operations
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriber(id: number): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  updateSubscriber(id: number, subscriber: Partial<InsertSubscriber>): Promise<Subscriber>;
  deleteSubscriber(id: number): Promise<void>;
  getSubscribersByCategories(categoryIds: number[]): Promise<Subscriber[]>;
  
  // Subscriber category operations
  getSubscriberCategories(subscriberId: number): Promise<Category[]>;
  setSubscriberCategories(subscriberId: number, categoryIds: number[]): Promise<void>;
  
  // Newsletter operations
  getNewsletters(): Promise<Newsletter[]>;
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, newsletter: Partial<InsertNewsletter>): Promise<Newsletter>;
  deleteNewsletter(id: number): Promise<void>;
  
  // Newsletter category operations
  getNewsletterCategories(newsletterId: number): Promise<Category[]>;
  setNewsletterCategories(newsletterId: number, categoryIds: number[]): Promise<void>;
  
  // Delivery operations
  createDelivery(delivery: {
    newsletterId: number;
    subscriberId: number;
    method: string;
    status: string;
  }): Promise<Delivery>;
  updateDeliveryStatus(id: number, status: string, openedAt?: Date): Promise<void>;
  getDeliveries(): Promise<Delivery[]>;
  
  // Analytics
  getSubscriberStats(): Promise<{
    total: number;
    newThisWeek: number;
    emailSubscribers: number;
    smsSubscribers: number;
  }>;
  getNewsletterStats(): Promise<{
    total: number;
    sent: number;
    drafts: number;
  }>;
  getDeliveryStats(): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    openRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // Subscriber operations
  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values({
        ...subscriberData,
        unsubscribeToken: nanoid(32),
        preferencesToken: nanoid(32),
      })
      .returning();
    return subscriber;
  }

  async updateSubscriber(id: number, subscriberData: Partial<InsertSubscriber>): Promise<Subscriber> {
    const [subscriber] = await db
      .update(subscribers)
      .set({ ...subscriberData, updatedAt: new Date() })
      .where(eq(subscribers.id, id))
      .returning();
    return subscriber;
  }

  async deleteSubscriber(id: number): Promise<void> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
  }

  async getSubscribersByCategories(categoryIds: number[]): Promise<Subscriber[]> {
    const subscriberIds = await db
      .selectDistinct({ subscriberId: subscriberCategories.subscriberId })
      .from(subscriberCategories)
      .where(inArray(subscriberCategories.categoryId, categoryIds));
    
    if (subscriberIds.length === 0) return [];
    
    return await db
      .select()
      .from(subscribers)
      .where(
        and(
          inArray(subscribers.id, subscriberIds.map(s => s.subscriberId)),
          eq(subscribers.isActive, true)
        )
      );
  }

  // Subscriber category operations
  async getSubscriberCategories(subscriberId: number): Promise<Category[]> {
    const result = await db
      .select({ category: categories })
      .from(subscriberCategories)
      .innerJoin(categories, eq(subscriberCategories.categoryId, categories.id))
      .where(eq(subscriberCategories.subscriberId, subscriberId));
    
    return result.map(r => r.category);
  }

  async setSubscriberCategories(subscriberId: number, categoryIds: number[]): Promise<void> {
    // Remove existing categories
    await db.delete(subscriberCategories).where(eq(subscriberCategories.subscriberId, subscriberId));
    
    // Add new categories
    if (categoryIds.length > 0) {
      await db.insert(subscriberCategories).values(
        categoryIds.map(categoryId => ({
          subscriberId,
          categoryId,
        }))
      );
    }
  }

  // Newsletter operations
  async getNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return newsletter;
  }

  async createNewsletter(newsletterData: InsertNewsletter): Promise<Newsletter> {
    const [newsletter] = await db
      .insert(newsletters)
      .values(newsletterData)
      .returning();
    return newsletter;
  }

  async updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter> {
    const [newsletter] = await db
      .update(newsletters)
      .set({ ...newsletterData, updatedAt: new Date() })
      .where(eq(newsletters.id, id))
      .returning();
    return newsletter;
  }

  async deleteNewsletter(id: number): Promise<void> {
    await db.delete(newsletters).where(eq(newsletters.id, id));
  }

  // Newsletter category operations
  async getNewsletterCategories(newsletterId: number): Promise<Category[]> {
    const result = await db
      .select({ category: categories })
      .from(newsletterCategories)
      .innerJoin(categories, eq(newsletterCategories.categoryId, categories.id))
      .where(eq(newsletterCategories.newsletterId, newsletterId));
    
    return result.map(r => r.category);
  }

  async setNewsletterCategories(newsletterId: number, categoryIds: number[]): Promise<void> {
    // Remove existing categories
    await db.delete(newsletterCategories).where(eq(newsletterCategories.newsletterId, newsletterId));
    
    // Add new categories
    if (categoryIds.length > 0) {
      await db.insert(newsletterCategories).values(
        categoryIds.map(categoryId => ({
          newsletterId,
          categoryId,
        }))
      );
    }
  }

  // Delivery operations
  async createDelivery(deliveryData: {
    newsletterId: number;
    subscriberId: number;
    method: string;
    status: string;
  }): Promise<Delivery> {
    const [delivery] = await db
      .insert(deliveries)
      .values(deliveryData)
      .returning();
    return delivery;
  }

  async updateDeliveryStatus(id: number, status: string, openedAt?: Date): Promise<void> {
    await db
      .update(deliveries)
      .set({ status, openedAt })
      .where(eq(deliveries.id, id));
  }

  async getDeliveries(): Promise<Delivery[]> {
    return await db.select().from(deliveries).orderBy(desc(deliveries.sentAt));
  }

  // Analytics
  async getSubscriberStats(): Promise<{
    total: number;
    newThisWeek: number;
    emailSubscribers: number;
    smsSubscribers: number;
  }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalResult] = await db.select({ count: count() }).from(subscribers);
    const [newThisWeekResult] = await db
      .select({ count: count() })
      .from(subscribers)
      .where(sql`${subscribers.createdAt} >= ${weekAgo}`);
    const [emailResult] = await db
      .select({ count: count() })
      .from(subscribers)
      .where(eq(subscribers.contactMethod, "email"));
    const [smsResult] = await db
      .select({ count: count() })
      .from(subscribers)
      .where(eq(subscribers.contactMethod, "sms"));

    return {
      total: totalResult.count,
      newThisWeek: newThisWeekResult.count,
      emailSubscribers: emailResult.count,
      smsSubscribers: smsResult.count,
    };
  }

  async getNewsletterStats(): Promise<{
    total: number;
    sent: number;
    drafts: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(newsletters);
    const [sentResult] = await db
      .select({ count: count() })
      .from(newsletters)
      .where(eq(newsletters.status, "sent"));
    const [draftsResult] = await db
      .select({ count: count() })
      .from(newsletters)
      .where(eq(newsletters.status, "draft"));

    return {
      total: totalResult.count,
      sent: sentResult.count,
      drafts: draftsResult.count,
    };
  }

  async getDeliveryStats(): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    openRate: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(deliveries);
    const [successfulResult] = await db
      .select({ count: count() })
      .from(deliveries)
      .where(eq(deliveries.status, "sent"));
    const [failedResult] = await db
      .select({ count: count() })
      .from(deliveries)
      .where(eq(deliveries.status, "failed"));
    const [openedResult] = await db
      .select({ count: count() })
      .from(deliveries)
      .where(sql`${deliveries.openedAt} IS NOT NULL`);

    const openRate = totalResult.count > 0 ? (openedResult.count / totalResult.count) * 100 : 0;

    return {
      totalDeliveries: totalResult.count,
      successfulDeliveries: successfulResult.count,
      failedDeliveries: failedResult.count,
      openRate: Math.round(openRate * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();
