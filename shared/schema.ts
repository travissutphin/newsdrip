import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  contactMethod: varchar("contact_method", { length: 10 }).notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull().default("weekly"),
  isActive: boolean("is_active").notNull().default(true),
  unsubscribeToken: varchar("unsubscribe_token", { length: 255 }),
  preferencesToken: varchar("preferences_token", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  template: varchar("template", { length: 50 }).notNull().default("classic"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  slug: varchar("slug", { length: 255 }),
  metaDescription: text("meta_description"),
  htmlContent: text("html_content"),
});

export const subscriberCategories = pgTable("subscriber_categories", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterCategories = pgTable("newsletter_categories", {
  id: serial("id").primaryKey(),
  newsletterId: integer("newsletter_id").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  newsletterId: integer("newsletter_id").notNull(),
  subscriberId: integer("subscriber_id").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  openedAt: timestamp("opened_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  newsletters: many(newsletters),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subscriberCategories: many(subscriberCategories),
  newsletterCategories: many(newsletterCategories),
}));

export const subscribersRelations = relations(subscribers, ({ many }) => ({
  subscriberCategories: many(subscriberCategories),
  deliveries: many(deliveries),
}));

export const newslettersRelations = relations(newsletters, ({ one, many }) => ({
  author: one(users, {
    fields: [newsletters.authorId],
    references: [users.id],
  }),
  newsletterCategories: many(newsletterCategories),
  deliveries: many(deliveries),
}));

export const subscriberCategoriesRelations = relations(subscriberCategories, ({ one }) => ({
  subscriber: one(subscribers, {
    fields: [subscriberCategories.subscriberId],
    references: [subscribers.id],
  }),
  category: one(categories, {
    fields: [subscriberCategories.categoryId],
    references: [categories.id],
  }),
}));

export const newsletterCategoriesRelations = relations(newsletterCategories, ({ one }) => ({
  newsletter: one(newsletters, {
    fields: [newsletterCategories.newsletterId],
    references: [newsletters.id],
  }),
  category: one(categories, {
    fields: [newsletterCategories.categoryId],
    references: [categories.id],
  }),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  newsletter: one(newsletters, {
    fields: [deliveries.newsletterId],
    references: [newsletters.id],
  }),
  subscriber: one(subscribers, {
    fields: [deliveries.subscriberId],
    references: [subscribers.id],
  }),
}));

// Insert schemas
export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  unsubscribeToken: true,
  preferencesToken: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  slug: true,
  metaDescription: true,
  htmlContent: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type SubscriberCategory = typeof subscriberCategories.$inferSelect;
export type NewsletterCategory = typeof newsletterCategories.$inferSelect;
