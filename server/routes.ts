import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuthRoutes } from "./auth";
import { setupServicesRoutes } from "./services";
import { setupChatRoutes } from "./chat";
import { setupEventsRoutes } from "./events";
import { setupNewsRoutes } from "./news";
import session from "express-session";
import { log } from "./vite";
import MemoryStore from "memorystore";

interface ChatClient {
  userId: number;
  username: string;
  socket: WebSocket;
}

export const activeClients: Map<number, ChatClient> = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a session store
  const SessionStore = MemoryStore(session);
  
  // Configure session middleware
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "romaniidinbelgia_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      }
    })
  );
  
  // Setup API routes
  setupAuthRoutes(app);
  setupServicesRoutes(app);
  setupChatRoutes(app);
  setupEventsRoutes(app);
  setupNewsRoutes(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (socket) => {
    let userId: number | null = null;
    
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message
        if (data.type === 'auth') {
          const { userId: newUserId, username } = data;
          
          if (!newUserId || !username) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid authentication data'
            }));
            return;
          }
          
          userId = newUserId;
          
          // Store client information
          activeClients.set(userId, {
            userId,
            username,
            socket
          });
          
          log(`User ${username} (ID: ${userId}) connected to chat`, 'websocket');
          
          // Notify client of successful authentication
          socket.send(JSON.stringify({
            type: 'auth_success',
            userId,
            username
          }));
          
          // Broadcast user joined to all clients
          broadcastMessage({
            type: 'user_joined',
            userId,
            username
          });
          
          return;
        }
        
        // Handle chat messages
        if (data.type === 'chat' && userId) {
          const { roomId, message } = data;
          
          if (!roomId || !message) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid chat message data'
            }));
            return;
          }
          
          // Store message in database
          storage.createChatMessage({
            userId,
            roomId,
            message
          }).then(savedMessage => {
            // Broadcast message to all clients
            broadcastMessage({
              type: 'chat',
              message: savedMessage
            });
          }).catch(error => {
            log(`Error saving chat message: ${error.message}`, 'websocket');
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to save message'
            }));
          });
          
          return;
        }
      } catch (error) {
        log(`Error processing WebSocket message: ${error}`, 'websocket');
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Handle client disconnect
    socket.on('close', () => {
      if (userId) {
        const client = activeClients.get(userId);
        if (client) {
          log(`User ${client.username} (ID: ${userId}) disconnected from chat`, 'websocket');
          
          // Remove client from active clients
          activeClients.delete(userId);
          
          // Broadcast user left to all clients
          broadcastMessage({
            type: 'user_left',
            userId,
            username: client.username
          });
        }
      }
    });
  });
  
  // Function to broadcast message to all connected clients
  function broadcastMessage(message: any) {
    const messageStr = JSON.stringify(message);
    
    activeClients.forEach(client => {
      if (client.socket && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(messageStr);
      }
    });
  }
  
  return httpServer;
}
