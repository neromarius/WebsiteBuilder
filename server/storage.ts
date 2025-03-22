import { 
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  chatMessages, type ChatMessage, type InsertChatMessage,
  events, type Event, type InsertEvent,
  eventParticipants, type EventParticipant, type InsertEventParticipant,
  news, type News, type InsertNews,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, SQL } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByUser(userId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Chat methods
  getChatMessages(roomId: string): Promise<(ChatMessage & { user?: User })[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage & { user?: User }>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByUser(userId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event participants
  getEventParticipants(eventId: number): Promise<EventParticipant[]>;
  getEventParticipant(eventId: number, userId: number): Promise<EventParticipant | undefined>;
  createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  deleteEventParticipant(eventId: number, userId: number): Promise<boolean>;
  
  // News methods
  getNews(): Promise<News[]>;
  getNewsItem(id: number): Promise<News | undefined>;
  createNewsItem(newsItem: InsertNews): Promise<News>;
  updateNewsItem(id: number, newsData: Partial<News>): Promise<News | undefined>;
  deleteNewsItem(id: number): Promise<boolean>;
  incrementNewsViews(id: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private chatMessages: Map<number, ChatMessage>;
  private events: Map<number, Event>;
  private eventParticipants: Map<number, EventParticipant>;
  private newsItems: Map<number, News>;
  
  currentUserId: number;
  currentServiceId: number;
  currentChatMessageId: number;
  currentEventId: number;
  currentEventParticipantId: number;
  currentNewsId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.chatMessages = new Map();
    this.events = new Map();
    this.eventParticipants = new Map();
    this.newsItems = new Map();
    
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentChatMessageId = 1;
    this.currentEventId = 1;
    this.currentEventParticipantId = 1;
    this.currentNewsId = 1;
    
    // Create admin user
    this.createUser({
      username: "admin",
      email: "admin@romaniinbelgia.be",
      password: "adminpass", // In production, this would be hashed
      fullName: "Administrator",
      phoneNumber: "+32123456789",
      location: "Bruxelles",
      isAdmin: true,
      isPremium: true
    });
    
    // Create some sample data for testing
    this.initializeData();
  }
  
  private initializeData() {
    // This would be initialized with real data in a production app
    // We're not mocking data as per instructions, just creating empty data structures
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      lastActive: now,
      badges: [],
      points: 0,
      isAdmin: insertUser.isAdmin || false,
      isModerator: insertUser.isModerator || false,
      isPremium: insertUser.isPremium || false,
      socialLinks: insertUser.socialLinks || [],
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      lastActive: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServicesByUser(userId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.userId === userId
    );
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const now = new Date();
    const newService: Service = {
      ...service,
      id,
      createdAt: now,
      updatedAt: now,
      rating: 0,
      reviewCount: 0,
      isPremium: false,
      images: [],
      tags: service.tags || [],
      socialLinks: service.socialLinks || {},
    };
    
    this.services.set(id, newService);
    return newService;
  }
  
  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = await this.getService(id);
    if (!service) return undefined;
    
    const updatedService = {
      ...service,
      ...serviceData,
      updatedAt: new Date()
    };
    
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  // Chat methods
  async getChatMessages(roomId: string): Promise<(ChatMessage & { user?: User })[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter((message) => message.roomId === roomId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Add user information to each message
    return Promise.all(
      messages.map(async (message) => {
        const user = await this.getUser(message.userId);
        return { ...message, user };
      })
    );
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage & { user?: User }> {
    const id = this.currentChatMessageId++;
    const now = new Date();
    const newMessage: ChatMessage = {
      ...message,
      id,
      createdAt: now
    };
    
    this.chatMessages.set(id, newMessage);
    
    // Add user information
    const user = await this.getUser(message.userId);
    return { ...newMessage, user };
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.userId === userId
    );
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const now = new Date();
    const newEvent: Event = {
      ...event,
      id,
      createdAt: now,
      tags: event.tags || [],
      socialLinks: event.socialLinks || {},
    };
    
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    const updatedEvent = {
      ...event,
      ...eventData,
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Event participants methods
  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return Array.from(this.eventParticipants.values()).filter(
      (participant) => participant.eventId === eventId
    );
  }
  
  async getEventParticipant(eventId: number, userId: number): Promise<EventParticipant | undefined> {
    return Array.from(this.eventParticipants.values()).find(
      (participant) => participant.eventId === eventId && participant.userId === userId
    );
  }
  
  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const id = this.currentEventParticipantId++;
    const now = new Date();
    const newParticipant: EventParticipant = {
      ...participant,
      id,
      createdAt: now
    };
    
    this.eventParticipants.set(id, newParticipant);
    
    // Update event participant count
    const event = await this.getEvent(participant.eventId);
    if (event) {
      const participants = await this.getEventParticipants(participant.eventId);
      await this.updateEvent(participant.eventId, {
        participantCount: participants.length
      });
    }
    
    return newParticipant;
  }
  
  async deleteEventParticipant(eventId: number, userId: number): Promise<boolean> {
    const participant = await this.getEventParticipant(eventId, userId);
    if (!participant) return false;
    
    const result = this.eventParticipants.delete(participant.id);
    
    // Update event participant count
    if (result) {
      const event = await this.getEvent(eventId);
      if (event) {
        const participants = await this.getEventParticipants(eventId);
        await this.updateEvent(eventId, {
          participantCount: participants.length
        });
      }
    }
    
    return result;
  }
  
  // News methods
  async getNews(): Promise<News[]> {
    return Array.from(this.newsItems.values()).sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }
  
  async getNewsItem(id: number): Promise<News | undefined> {
    return this.newsItems.get(id);
  }
  
  async createNewsItem(newsItem: InsertNews): Promise<News> {
    const id = this.currentNewsId++;
    const now = new Date();
    const newNewsItem: News = {
      ...newsItem,
      id,
      createdAt: now,
      viewCount: 0,
      commentCount: 0
    };
    
    this.newsItems.set(id, newNewsItem);
    return newNewsItem;
  }
  
  async updateNewsItem(id: number, newsData: Partial<News>): Promise<News | undefined> {
    const newsItem = await this.getNewsItem(id);
    if (!newsItem) return undefined;
    
    const updatedNewsItem = {
      ...newsItem,
      ...newsData,
    };
    
    this.newsItems.set(id, updatedNewsItem);
    return updatedNewsItem;
  }
  
  async deleteNewsItem(id: number): Promise<boolean> {
    return this.newsItems.delete(id);
  }
  
  async incrementNewsViews(id: number): Promise<number> {
    const newsItem = await this.getNewsItem(id);
    if (!newsItem) return 0;
    
    const newViewCount = (newsItem.viewCount || 0) + 1;
    await this.updateNewsItem(id, { viewCount: newViewCount });
    
    return newViewCount;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        email: insertUser.email,
        password: insertUser.password,
        fullName: insertUser.fullName || null,
        phoneNumber: insertUser.phoneNumber || null,
        location: insertUser.location || null,
        about: insertUser.about || null,
        profileImage: insertUser.profileImage || null,
        isPremium: insertUser.isPremium || false,
        isAdmin: insertUser.isAdmin || false,
        isModerator: insertUser.isModerator || false,
        socialLinks: insertUser.socialLinks || [],
        badges: insertUser.badges || [],
        points: insertUser.points || 0
      })
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        lastActive: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }
  
  // Service methods
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }
  
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }
  
  async getServicesByUser(userId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.userId, userId));
  }
  
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values({
        userId: service.userId,
        title: service.title,
        description: service.description,
        shortDescription: service.shortDescription,
        category: service.category,
        location: service.location || null,
        contactEmail: service.contactEmail || null,
        contactPhone: service.contactPhone || null,
        mainImage: service.mainImage || null,
        images: service.images || [],
        tags: service.tags || [],
        rating: service.rating || 0,
        reviewCount: service.reviewCount || 0,
        isPremium: service.isPremium || false,
        socialLinks: service.socialLinks || {}
      })
      .returning();
    
    return newService;
  }
  
  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set({
        ...serviceData,
        updatedAt: new Date()
      })
      .where(eq(services.id, id))
      .returning();
    
    return updatedService || undefined;
  }
  
  async deleteService(id: number): Promise<boolean> {
    const [deletedService] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();
    
    return !!deletedService;
  }
  
  // Chat methods
  async getChatMessages(roomId: string): Promise<(ChatMessage & { user?: User })[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(chatMessages.createdAt);
    
    // Add user information to each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await this.getUser(message.userId);
        return { ...message, user };
      })
    );
    
    return messagesWithUsers;
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage & { user?: User }> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        userId: message.userId,
        roomId: message.roomId,
        message: message.message
      })
      .returning();
    
    // Add user information
    const user = await this.getUser(message.userId);
    return { ...newMessage, user };
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.userId, userId));
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({
        userId: event.userId,
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate || null,
        location: event.location || null,
        image: event.image || null,
        category: event.category || null,
        tags: event.tags || [],
        socialLinks: event.socialLinks || {},
        gpsLocation: event.gpsLocation || null,
        participantCount: event.participantCount || 0,
        isParticipating: event.isParticipating || false
      })
      .returning();
    
    return newEvent;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent || undefined;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();
    
    return !!deletedEvent;
  }
  
  // Event participants methods
  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return await db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId));
  }
  
  async getEventParticipant(eventId: number, userId: number): Promise<EventParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      );
    
    return participant || undefined;
  }
  
  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const [newParticipant] = await db
      .insert(eventParticipants)
      .values({
        eventId: participant.eventId,
        userId: participant.userId
      })
      .returning();
    
    // Update event participant count
    const participants = await this.getEventParticipants(participant.eventId);
    await this.updateEvent(participant.eventId, {
      participantCount: participants.length
    });
    
    return newParticipant;
  }
  
  async deleteEventParticipant(eventId: number, userId: number): Promise<boolean> {
    const [deletedParticipant] = await db
      .delete(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      )
      .returning();
    
    if (deletedParticipant) {
      // Update event participant count
      const participants = await this.getEventParticipants(eventId);
      await this.updateEvent(eventId, {
        participantCount: participants.length
      });
    }
    
    return !!deletedParticipant;
  }
  
  // News methods
  async getNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .orderBy(desc(news.publishedAt));
  }
  
  async getNewsItem(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem || undefined;
  }
  
  async createNewsItem(newsItem: InsertNews): Promise<News> {
    const [newNewsItem] = await db
      .insert(news)
      .values({
        title: newsItem.title,
        content: newsItem.content,
        source: newsItem.source,
        sourceUrl: newsItem.sourceUrl,
        category: newsItem.category || null,
        image: newsItem.image || null,
        publishedAt: newsItem.publishedAt,
        viewCount: 0,
        commentCount: 0
      })
      .returning();
    
    return newNewsItem;
  }
  
  async updateNewsItem(id: number, newsData: Partial<News>): Promise<News | undefined> {
    const [updatedNewsItem] = await db
      .update(news)
      .set(newsData)
      .where(eq(news.id, id))
      .returning();
    
    return updatedNewsItem || undefined;
  }
  
  async deleteNewsItem(id: number): Promise<boolean> {
    const [deletedNewsItem] = await db
      .delete(news)
      .where(eq(news.id, id))
      .returning();
    
    return !!deletedNewsItem;
  }
  
  async incrementNewsViews(id: number): Promise<number> {
    const newsItem = await this.getNewsItem(id);
    if (!newsItem) return 0;
    
    const [updatedNewsItem] = await db
      .update(news)
      .set({ viewCount: (newsItem.viewCount || 0) + 1 })
      .where(eq(news.id, id))
      .returning();
    
    return updatedNewsItem.viewCount || 0;
  }
}

// Create an admin user at startup if it doesn't exist
async function initializeDatabase() {
  try {
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);
    
    if (adminUser.length === 0) {
      await db.insert(users).values({
        username: "admin",
        email: "admin@romaniinbelgia.be",
        password: "adminpass", // In a production app, this would be hashed
        fullName: "Administrator",
        phoneNumber: "+32123456789",
        location: "Bruxelles",
        about: "Administrator al comunității românilor din Belgia",
        profileImage: null,
        isAdmin: true,
        isModerator: true,
        isPremium: true,
        socialLinks: [],
        badges: ["admin", "moderator"],
        points: 1000
      });
      console.log("Created admin user");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize the database
initializeDatabase().catch(console.error);

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
