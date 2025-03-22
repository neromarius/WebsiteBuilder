import { pgTable, text, serial, integer, boolean, timestamp, json, index, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  about: true,
  profileImage: true,
  isPremium: true,
  isAdmin: true,
  isModerator: true,
  socialLinks: true,
  badges: true,
  points: true,
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (table) => {
  return {
    userIdIdx: index("service_user_id_idx").on(table.userId),
    categoryIdx: index("service_category_idx").on(table.category),
    locationIdx: index("service_location_idx").on(table.location),
  };
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
  socialLinks: true,
  images: true,
  isPremium: true,
  rating: true,
  reviewCount: true,
});

// Chat rooms
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("message-square"),
  category: text("category").default("general"),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => {
  return {
    roomIdIdx: index("chat_room_roomid_idx").on(table.roomId),
    categoryIdx: index("chat_room_category_idx").on(table.category),
  };
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).pick({
  roomId: true,
  name: true,
  description: true,
  icon: true,
  category: true,
  isPrivate: true,
  createdBy: true,
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: text("room_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("chat_user_id_idx").on(table.userId),
    roomIdIdx: index("chat_room_id_idx").on(table.roomId),
    createdAtIdx: index("chat_created_at_idx").on(table.createdAt),
  };
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  roomId: true,
  message: true,
});

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  participantCount: integer("participant_count").default(0),
  isParticipating: boolean("is_participating").default(false),
}, (table) => {
  return {
    userIdIdx: index("event_user_id_idx").on(table.userId),
    dateIdx: index("event_date_idx").on(table.date),
    categoryIdx: index("event_category_idx").on(table.category),
    locationIdx: index("event_location_idx").on(table.location),
  };
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
  participantCount: true,
  isParticipating: true,
});

// Event participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("participant_event_id_idx").on(table.eventId),
    userIdIdx: index("participant_user_id_idx").on(table.userId),
    eventUserUniqueIdx: uniqueIndex("event_user_unique_idx").on(table.eventId, table.userId),
  };
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
}, (table) => {
  return {
    publishedAtIdx: index("news_published_at_idx").on(table.publishedAt),
    categoryIdx: index("news_category_idx").on(table.category),
    viewCountIdx: index("news_view_count_idx").on(table.viewCount),
  };
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

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  events: many(events),
  chatMessages: many(chatMessages),
  eventParticipations: many(eventParticipants),
  chatRoomsCreated: many(chatRooms),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  user: one(users, {
    fields: [services.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one }) => ({
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));
