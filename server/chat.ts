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
  
  // Get available chat rooms
  app.get('/api/chat/rooms', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const isPrivate = req.query.isPrivate !== undefined ? req.query.isPrivate === 'true' : undefined;
      
      const options: { category?: string, isPrivate?: boolean } = {};
      if (category) options.category = category;
      if (isPrivate !== undefined) options.isPrivate = isPrivate;
      
      const rooms = await storage.getChatRooms(options);
      
      // Map rooms to a simplified format for the API
      const mappedRooms = rooms.map(room => ({
        id: room.roomId,
        name: room.name,
        description: room.description || '',
        icon: room.icon || 'message-square',
        category: room.category || 'general',
        isPrivate: room.isPrivate || false
      }));
      
      res.status(200).json(mappedRooms);
    } catch (error) {
      log(`Error getting chat rooms: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred getting chat rooms" });
    }
  });
  
  // Get a specific chat room by ID
  app.get('/api/chat/rooms/:roomId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const roomId = req.params.roomId;
      
      if (!roomId) {
        return res.status(400).json({ message: "Room ID is required" });
      }
      
      const room = await storage.getChatRoomByRoomId(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      res.status(200).json({
        id: room.roomId,
        name: room.name,
        description: room.description || '',
        icon: room.icon || 'message-square',
        category: room.category || 'general',
        isPrivate: room.isPrivate || false
      });
    } catch (error) {
      log(`Error getting chat room: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred getting the chat room" });
    }
  });
  
  // Create a new chat room
  app.post('/api/chat/rooms', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is admin or moderator
      const user = await storage.getUser(userId);
      if (!user || (!user.isAdmin && !user.isModerator)) {
        return res.status(403).json({ message: "Only moderators and admins can create chat rooms" });
      }
      
      // Validate request body
      const roomSchema = z.object({
        roomId: z.string().min(3, {
          message: "Room ID must be at least 3 characters long",
        }).regex(/^[a-z0-9-]+$/, {
          message: "Room ID can only contain lowercase letters, numbers, and dashes",
        }),
        name: z.string().min(3, {
          message: "Room name must be at least 3 characters long",
        }),
        description: z.string().optional(),
        icon: z.string().optional(),
        category: z.string().optional(),
        isPrivate: z.boolean().optional(),
      });
      
      const validatedData = roomSchema.parse(req.body);
      
      // Check if a room with this ID already exists
      const existingRoom = await storage.getChatRoomByRoomId(validatedData.roomId);
      if (existingRoom) {
        return res.status(409).json({ message: "A chat room with this ID already exists" });
      }
      
      // Create the room
      const newRoom = await storage.createChatRoom({
        ...validatedData,
        createdBy: userId
      });
      
      log(`Chat room created: ${validatedData.name} (${validatedData.roomId}) by user ${userId}`, 'chat');
      
      res.status(201).json({
        id: newRoom.roomId,
        name: newRoom.name,
        description: newRoom.description || '',
        icon: newRoom.icon || 'message-square',
        category: newRoom.category || 'general',
        isPrivate: newRoom.isPrivate || false
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error creating chat room: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred creating the chat room" });
    }
  });
  
  // Update a chat room
  app.patch('/api/chat/rooms/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const roomId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is admin or moderator
      const user = await storage.getUser(userId);
      if (!user || (!user.isAdmin && !user.isModerator)) {
        return res.status(403).json({ message: "Only moderators and admins can update chat rooms" });
      }
      
      // Validate request body
      const roomSchema = z.object({
        name: z.string().min(3, {
          message: "Room name must be at least 3 characters long",
        }).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        category: z.string().optional(),
        isPrivate: z.boolean().optional(),
      });
      
      const validatedData = roomSchema.parse(req.body);
      
      // Update the room
      const updatedRoom = await storage.updateChatRoom(roomId, validatedData);
      
      if (!updatedRoom) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      log(`Chat room updated: ${updatedRoom.name} (${updatedRoom.roomId}) by user ${userId}`, 'chat');
      
      res.status(200).json({
        id: updatedRoom.roomId,
        name: updatedRoom.name,
        description: updatedRoom.description || '',
        icon: updatedRoom.icon || 'message-square',
        category: updatedRoom.category || 'general',
        isPrivate: updatedRoom.isPrivate || false
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Error updating chat room: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred updating the chat room" });
    }
  });
  
  // Delete a chat room
  app.delete('/api/chat/rooms/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      const roomId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is admin
      const user = await storage.getUser(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Only admins can delete chat rooms" });
      }
      
      // Delete the room
      const deleted = await storage.deleteChatRoom(roomId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      log(`Chat room deleted: ID ${roomId} by user ${userId}`, 'chat');
      
      res.status(200).json({ message: "Chat room deleted successfully" });
    } catch (error) {
      log(`Error deleting chat room: ${error}`, 'chat');
      res.status(500).json({ message: "An error occurred deleting the chat room" });
    }
  });
}
