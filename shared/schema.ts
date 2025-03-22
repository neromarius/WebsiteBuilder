import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  location: text("location"),
  about: text("about"),
  profileImage: text("profile_image"),
  isPremium: boolean("is_premium").default(false),
  isAdmin: boolean("is_admin").default(false),
  isModerator: boolean("is_moderator").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
  socialLinks: json("social_links").$type<string[]>().default([]),
  badges: json("badges").$type<string[]>().default([]),
  points: integer("points").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  phoneNumber: true,
  location: true,
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  category: text("category").notNull(),
  location: text("location"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  mainImage: text("main_image"),
  images: json("images").$type<string[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isPremium: boolean("is_premium").default(false),
  socialLinks: json("social_links").$type<{[key: string]: string}>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  userId: true,
  title: true,
  description: true,
  shortDescription: true,
  category: true,
  location: true,
  contactEmail: true,
  contactPhone: true,
  mainImage: true,
  tags: true,
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomId: text("room_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  roomId: true,
  message: true,
});

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  image: text("image"),
  category: text("category"),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  socialLinks: json("social_links").$type<{[key: string]: string}>().default({}),
  gpsLocation: text("gps_location"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  date: true,
  endDate: true,
  location: true,
  image: true,
  category: true,
  tags: true,
  socialLinks: true,
  gpsLocation: true,
});

// Event participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).pick({
  eventId: true,
  userId: true,
});

// News
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  category: text("category"),
  image: text("image"),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  viewCount: integer("view_count").default(0),
  commentCount: integer("comment_count").default(0),
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  source: true,
  sourceUrl: true,
  category: true,
  image: true,
  publishedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
