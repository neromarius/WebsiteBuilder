import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { log } from "./vite";

// Extended request type that includes session
interface AuthenticatedRequest extends Request {
  session: {
    userId?: number;
  } & Express.Session;
}

// Register schema with password validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
});

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

// Middleware to check if user is authenticated
export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export function setupAuthRoutes(app: Express) {
  // Register route
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // In a production app, we would hash the password here
      // const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create new user
      const newUser = await storage.createUser({
        ...validatedData,
        // password: hashedPassword, // In production, store hashed password
      });
      
      // Set user session
      (req as AuthenticatedRequest).session.userId = newUser.id;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      log(`User registered: ${newUser.username} (ID: ${newUser.id})`, 'auth');
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Registration error: ${error}`, 'auth');
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  
  // Login route
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a production app, we would verify the password hash here
      // const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
      const passwordMatch = validatedData.password === user.password; // This is insecure, for demo only
      
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Update last active timestamp
      await storage.updateUser(user.id, { lastActive: new Date() });
      
      // Set user session
      (req as AuthenticatedRequest).session.userId = user.id;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      log(`User logged in: ${user.username} (ID: ${user.id})`, 'auth');
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Login error: ${error}`, 'auth');
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  // Logout route
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).session.userId;
    
    if (userId) {
      log(`User logged out: (ID: ${userId})`, 'auth');
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user route
  app.get('/api/auth/me', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        // Clear invalid session
        req.session.destroy((err) => {
          if (err) {
            log(`Error destroying invalid session: ${err}`, 'auth');
          }
        });
        
        return res.status(401).json({ message: "User not found" });
      }
      
      // Update last active timestamp
      await storage.updateUser(user.id, { lastActive: new Date() });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      log(`Get current user error: ${error}`, 'auth');
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Update user profile
  app.patch('/api/users/profile', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get current user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate request body - only allow certain fields to be updated
      const updateSchema = z.object({
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        location: z.string().optional(),
        about: z.string().optional(),
        profileImage: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Check if email is being changed and already exists
      if (validatedData.email && validatedData.email !== user.email) {
        const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      log(`User profile updated: ${user.username} (ID: ${user.id})`, 'auth');
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      log(`Update profile error: ${error}`, 'auth');
      res.status(500).json({ message: "An error occurred updating the profile" });
    }
  });
}
