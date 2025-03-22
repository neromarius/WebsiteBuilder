import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { log } from "./vite";
import { activeClients } from "./routes";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

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

export function setupChatRoutes(app: Express) {
  // Get chat messages by room ID
  app.get('/api/chat/messages/:roomId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const roomId = req.params.roomId;
      
      if (!roomId) {
        return res.status(400).json({ message: "Room ID is required" });
      }
      
      const messages = await storage.getChatMessages(roomId);
      res.status(200).json(messages);
    } catch (error) {
      log(`Error getting chat messages: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred getting chat messages" });
    }
  });
  
  // Send a chat message (fallback API route if WebSocket is not available)
  app.post('/api/chat/messages', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const messageSchema = insertChatMessageSchema.extend({
        roomId: z.string().min(1, {
          message: "Room ID is required",
        }),
        message: z.string().min(1, {
          message: "Message cannot be empty",
        }),
      });
      
      const validatedData = messageSchema.parse({
        ...req.body,
        userId, // Ensure the message is created for the authenticated user
      });
      
      // Create the message
      const newMessage = await storage.createChatMessage(validatedData);
      
      log(`Chat message created in room ${validatedData.roomId} by user ${userId}`, 'chat');
      
      // Broadcast message via WebSocket if available
      activeClients.forEach(client => {
        if (client.socket && client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify({
            type: 'chat',
            message: newMessage
          }));
        }
      });
      
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error creating chat message: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred creating the chat message" });
    }
  });
  
  // Get online users
  app.get('/api/chat/users/online', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Get all user IDs from active clients
      const userIds = Array.from(activeClients.keys());
      
      // Get user info for each connected user
      const onlineUsers = await Promise.all(
        userIds.map(async (userId) => {
          const user = await storage.getUser(userId);
          
          if (!user) return null;
          
          // Return only necessary user info
          return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            profileImage: user.profileImage,
            isAdmin: user.isAdmin,
            isModerator: user.isModerator
          };
        })
      );
      
      // Filter out nulls
      const validUsers = onlineUsers.filter(Boolean);
      
      res.status(200).json(validUsers);
    } catch (error) {
      log(`Error getting online users: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred getting online users" });
    }
  });
  
  // Get available chat rooms (could be dynamic in the future)
  app.get('/api/chat/rooms', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
    try {
      const rooms = [
        { id: "general", name: "General", description: "Discuții generale pentru comunitate" },
        { id: "transport", name: "Transport", description: "Discuții despre transport, curse și călătorii între România și Belgia" },
        { id: "intrebari", name: "Întrebări", description: "Pune întrebări comunității și primește răspunsuri" }
      ];
      
      res.status(200).json(rooms);
    } catch (error) {
      log(`Error getting chat rooms: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred getting chat rooms" });
    }
  });
}
