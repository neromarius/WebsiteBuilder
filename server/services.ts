import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertServiceSchema } from "@shared/schema";
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

export function setupServicesRoutes(app: Express) {
  // Get all services
  app.get('/api/services', async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.status(200).json(services);
    } catch (error) {
      log(`Error getting services: ${error}`, 'services');
      res.status(500).json({ message: "An error occurred getting services" });
    }
  });
  
  // Get a specific service by ID
  app.get('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Get the user who created the service
      const user = await storage.getUser(service.userId);
      
      // Return service with user information
      res.status(200).json({
        ...service,
        user: user ? {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          profileImage: user.profileImage,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          isModerator: user.isModerator,
          createdAt: user.createdAt,
        } : undefined
      });
    } catch (error) {
      log(`Error getting service: ${error}`, 'services');
      res.status(500).json({ message: "An error occurred getting the service" });
    }
  });
  
  // Get services by current user
  app.get('/api/services/user', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const services = await storage.getServicesByUser(userId);
      res.status(200).json(services);
    } catch (error) {
      log(`Error getting user services: ${error}`, 'services');
      res.status(500).json({ message: "An error occurred getting user services" });
    }
  });
  
  // Create a new service
  app.post('/api/services', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const validatedData = insertServiceSchema.parse({
        ...req.body,
        userId, // Ensure the service is created for the authenticated user
      });
      
      // Create the service
      const newService = await storage.createService(validatedData);
      
      log(`Service created: ${newService.title} (ID: ${newService.id}) by user ${userId}`, 'services');
      
      res.status(201).json(newService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error creating service: ${error}`, 'services');
      res.status(500).json({ message: "An error occurred creating the service" });
    }
  });
  
  // Update a service
  app.patch('/api/services/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const serviceId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Get the service
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Check if the user is the owner of the service
      if (service.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this service" });
      }
      
      // Validate request body - only allow certain fields to be updated
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        mainImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        socialLinks: z.record(z.string()).optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update the service
      const updatedService = await storage.updateService(serviceId, validatedData);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      log(`Service updated: ${updatedService.title} (ID: ${updatedService.id})`, 'services');
      
      res.status(200).json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error updating service: ${error}`, 'services');
      res.status(500).json({ message: "An error occurred updating the service" });
    }
  });
  
  // Delete a service
  app.delete('/api/services/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const serviceId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Get the service
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Check if the user is the owner of the service or an admin
      const user = await storage.getUser(userId);
      if (service.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this service" });
      }
      
      // Delete the service
      const result = await storage.deleteService(serviceId);
      
      if (!result) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      log(`Service deleted: (ID: ${serviceId})`, 'services');
      
      res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
      log(`Error deleting service: ${error}`, 'services');
      res.status(500).json({ message: "An error occurred deleting the service" });
    }
  });
}
