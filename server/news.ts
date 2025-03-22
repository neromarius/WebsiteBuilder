import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertNewsSchema } from "@shared/schema";
import { z } from "zod";
import { log } from "./vite";

// Define request with session
interface AuthenticatedRequest extends Request {
  session: {
    userId?: number;
  } & Express.Session;
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
};

export function setupNewsRoutes(app: Express) {
  // Get all news
  app.get('/api/news', async (req: Request, res: Response) => {
    try {
      const newsItems = await storage.getNews();
      res.status(200).json(newsItems);
    } catch (error) {
      log(`Error getting news: ${error}`, 'news');
      res.status(500).json({ message: "An error occurred getting news" });
    }
  });
  
  // Get a specific news item by ID
  app.get('/api/news/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid news ID" });
      }
      
      const newsItem = await storage.getNewsItem(id);
      
      if (!newsItem) {
        return res.status(404).json({ message: "News item not found" });
      }
      
      // Increment view count
      await storage.incrementNewsViews(id);
      
      res.status(200).json(newsItem);
    } catch (error) {
      log(`Error getting news item: ${error}`, 'news');
      res.status(500).json({ message: "An error occurred getting the news item" });
    }
  });
  
  // Create a new news item (admin only)
  app.post('/api/news', isAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertNewsSchema.parse(req.body);
      
      // Create the news item
      const newNewsItem = await storage.createNewsItem(validatedData);
      
      log(`News item created: ${newNewsItem.title} (ID: ${newNewsItem.id})`, 'news');
      
      res.status(201).json(newNewsItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error creating news item: ${error}`, 'news');
      res.status(500).json({ message: "An error occurred creating the news item" });
    }
  });
  
  // Update a news item (admin only)
  app.patch('/api/news/:id', isAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const newsId = parseInt(req.params.id);
      
      if (isNaN(newsId)) {
        return res.status(400).json({ message: "Invalid news ID" });
      }
      
      // Get the news item
      const newsItem = await storage.getNewsItem(newsId);
      
      if (!newsItem) {
        return res.status(404).json({ message: "News item not found" });
      }
      
      // Validate request body - only allow certain fields to be updated
      const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        source: z.string().optional(),
        sourceUrl: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        publishedAt: z.coerce.date().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update the news item
      const updatedNewsItem = await storage.updateNewsItem(newsId, validatedData);
      
      if (!updatedNewsItem) {
        return res.status(404).json({ message: "News item not found" });
      }
      
      log(`News item updated: ${updatedNewsItem.title} (ID: ${updatedNewsItem.id})`, 'news');
      
      res.status(200).json(updatedNewsItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error updating news item: ${error}`, 'news');
      res.status(500).json({ message: "An error occurred updating the news item" });
    }
  });
  
  // Delete a news item (admin only)
  app.delete('/api/news/:id', isAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const newsId = parseInt(req.params.id);
      
      if (isNaN(newsId)) {
        return res.status(400).json({ message: "Invalid news ID" });
      }
      
      // Get the news item
      const newsItem = await storage.getNewsItem(newsId);
      
      if (!newsItem) {
        return res.status(404).json({ message: "News item not found" });
      }
      
      // Delete the news item
      const result = await storage.deleteNewsItem(newsId);
      
      if (!result) {
        return res.status(404).json({ message: "News item not found" });
      }
      
      log(`News item deleted: (ID: ${newsId})`, 'news');
      
      res.status(200).json({ message: "News item deleted successfully" });
    } catch (error) {
      log(`Error deleting news item: ${error}`, 'news');
      res.status(500).json({ message: "An error occurred deleting the news item" });
    }
  });
  
  // Fetch news from external sources (to be implemented)
  // This would normally use a third-party API to fetch news
  app.post('/api/news/fetch', isAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Here we would implement the logic to fetch news from external sources
      // For example, using a news API to get Romanian and Belgian news
      
      // For demonstration purposes, we'll create a few sample news items
      const mockSources = [
        { name: "Business Belgium", url: "https://www.businessbelgium.be" },
        { name: "Le Soir", url: "https://www.lesoir.be" },
        { name: "Radio România Actualități", url: "https://www.romania-actualitati.ro" }
      ];
      
      const categories = ["Economie", "Legislație", "Cultură", "România", "Belgia"];
      
      // In a real implementation, this would fetch from actual news APIs
      // For now, we'll just log that the process would happen
      log("News fetching process would be triggered here", 'news');
      
      res.status(200).json({
        message: "News fetching process would be triggered here. In a real implementation, this would connect to news APIs and store the latest news.",
        sources: mockSources,
        categories: categories
      });
    } catch (error) {
      log(`Error fetching news: ${error}`, 'news');
      res.status(500).json({ message: "An error occurred fetching news" });
    }
  });
}
