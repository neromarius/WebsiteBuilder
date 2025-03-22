import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertEventSchema, insertEventParticipantSchema } from "@shared/schema";
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

export function setupEventsRoutes(app: Express) {
  // Get all events
  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      
      // Check if user is authenticated to add participation flag
      const userId = (req as AuthenticatedRequest).session.userId;
      
      let eventsWithParticipation = events;
      
      // If user is authenticated, check if they're participating in each event
      if (userId) {
        eventsWithParticipation = await Promise.all(
          events.map(async (event) => {
            const participant = await storage.getEventParticipant(event.id, userId);
            return {
              ...event,
              isParticipating: !!participant
            };
          })
        );
      }
      
      res.status(200).json(eventsWithParticipation);
    } catch (error) {
      log(`Error getting events: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred getting events" });
    }
  });
  
  // Get a specific event by ID
  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Get the user who created the event
      const user = await storage.getUser(event.userId);
      
      // Get participants
      const participants = await storage.getEventParticipants(id);
      
      // Check if the requestor is participating
      const userId = (req as AuthenticatedRequest).session.userId;
      let isParticipating = false;
      
      if (userId) {
        const participant = await storage.getEventParticipant(id, userId);
        isParticipating = !!participant;
      }
      
      // Return event with user information and participation data
      res.status(200).json({
        ...event,
        isParticipating,
        participantCount: participants.length,
        user: user ? {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        } : undefined
      });
    } catch (error) {
      log(`Error getting event: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred getting the event" });
    }
  });
  
  // Get events by current user
  app.get('/api/events/user', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const events = await storage.getEventsByUser(userId);
      
      // Add participant count to each event
      const eventsWithParticipants = await Promise.all(
        events.map(async (event) => {
          const participants = await storage.getEventParticipants(event.id);
          return {
            ...event,
            participantCount: participants.length
          };
        })
      );
      
      res.status(200).json(eventsWithParticipants);
    } catch (error) {
      log(`Error getting user events: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred getting user events" });
    }
  });
  
  // Create a new event
  app.post('/api/events', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const validatedData = insertEventSchema.parse({
        ...req.body,
        userId, // Ensure the event is created for the authenticated user
      });
      
      // Create the event
      const newEvent = await storage.createEvent(validatedData);
      
      log(`Event created: ${newEvent.title} (ID: ${newEvent.id}) by user ${userId}`, 'events');
      
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error creating event: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred creating the event" });
    }
  });
  
  // Update an event
  app.patch('/api/events/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const eventId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Get the event
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the user is the owner of the event
      if (event.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this event" });
      }
      
      // Validate request body - only allow certain fields to be updated
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        location: z.string().optional(),
        image: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        socialLinks: z.record(z.string()).optional(),
        gpsLocation: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update the event
      const updatedEvent = await storage.updateEvent(eventId, validatedData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      log(`Event updated: ${updatedEvent.title} (ID: ${updatedEvent.id})`, 'events');
      
      res.status(200).json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error updating event: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred updating the event" });
    }
  });
  
  // Delete an event
  app.delete('/api/events/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const eventId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Get the event
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the user is the owner of the event or an admin
      const user = await storage.getUser(userId);
      if (event.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this event" });
      }
      
      // Delete the event
      const result = await storage.deleteEvent(eventId);
      
      if (!result) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      log(`Event deleted: (ID: ${eventId})`, 'events');
      
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      log(`Error deleting event: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred deleting the event" });
    }
  });
  
  // Event participation routes
  
  // Participate in an event
  app.post('/api/events/:id/participate', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const eventId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if the event exists
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is already participating
      const existingParticipant = await storage.getEventParticipant(eventId, userId);
      
      if (existingParticipant) {
        return res.status(400).json({ message: "You are already participating in this event" });
      }
      
      // Create participation
      const participant = await storage.createEventParticipant({
        eventId,
        userId
      });
      
      log(`User ${userId} is now participating in event ${eventId}`, 'events');
      
      res.status(201).json(participant);
    } catch (error) {
      log(`Error participating in event: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred participating in the event" });
    }
  });
  
  // Cancel participation in an event
  app.delete('/api/events/:id/participate', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const eventId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if the event exists
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is participating
      const existingParticipant = await storage.getEventParticipant(eventId, userId);
      
      if (!existingParticipant) {
        return res.status(400).json({ message: "You are not participating in this event" });
      }
      
      // Delete participation
      const result = await storage.deleteEventParticipant(eventId, userId);
      
      if (!result) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      log(`User ${userId} is no longer participating in event ${eventId}`, 'events');
      
      res.status(200).json({ message: "Participation cancelled successfully" });
    } catch (error) {
      log(`Error cancelling participation: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred cancelling participation" });
    }
  });
  
  // Get event participants
  app.get('/api/events/:id/participants', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Get participants
      const participants = await storage.getEventParticipants(eventId);
      
      // Get user details for each participant
      const participantsWithDetails = await Promise.all(
        participants.map(async (participant) => {
          const user = await storage.getUser(participant.userId);
          return {
            ...participant,
            user: user ? {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              profileImage: user.profileImage,
            } : undefined
          };
        })
      );
      
      res.status(200).json(participantsWithDetails);
    } catch (error) {
      log(`Error getting event participants: ${error}`, 'events');
      res.status(500).json({ message: "An error occurred getting event participants" });
    }
  });
}
