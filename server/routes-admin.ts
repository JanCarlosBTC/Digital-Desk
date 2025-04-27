import { Router } from 'express';
import type { Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from './replitAuth.js';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

// Middleware to check if user is an admin
const isAdmin = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admin access required" });
};

// Input validation schemas
const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  isAdmin: z.boolean().optional().default(false)
});

// Get all users (admin only)
router.get('/admin/users', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        initials: true,
        isAdmin: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format users to show "never" for those who haven't logged in
    const formattedUsers = users.map(user => ({
      ...user,
      lastLoginFormatted: user.lastLogin 
        ? user.lastLogin.toISOString().split('T')[0] // Format as YYYY-MM-DD
        : "never"
    }));
    
    return res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get user statistics (count, etc.)
router.get('/admin/stats', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Count total users
    const totalUsers = await prisma.user.count();
    
    // Count users who have logged in
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: {
          not: null
        }
      }
    });
    
    // Get newest user
    const newestUser = await prisma.user.findFirst({
      select: {
        username: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newestUser
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ message: "Failed to fetch admin statistics" });
  }
});

// Create a new user
router.post('/admin/users', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate input
    const validatedData = createUserSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: "Invalid user data", 
        errors: validatedData.error.format() 
      });
    }
    
    const { username, email, name, isAdmin } = validatedData.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: "User with this username or email already exists" });
    }
    
    // Generate initials from name
    let initials = "";
    const nameParts = name ? name.split(' ') : [];
    if (nameParts.length >= 2 && nameParts[0] && nameParts[1]) {
      initials = (nameParts[0][0] || "") + (nameParts[1][0] || "");
    } else if (nameParts.length === 1 && nameParts[0]) {
      initials = nameParts[0].substring(0, 2);
    } else if (username) {
      initials = username.substring(0, 2);
    }
    
    initials = initials.toUpperCase();
    
    // Create user
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        username,
        email,
        name,
        initials,
        isAdmin: isAdmin || false,
        password: "" // Empty password - user will need to set via invitation
      }
    });
    
    // Return user without sensitive data
    const { password, ...userData } = user;
    
    return res.status(201).json(userData);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
});

// Generate an invitation link for a user
router.post('/admin/users/:id/invite', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store token with expiration
    if (!id) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const inviteLink = await prisma.userInvite.create({
      data: {
        userId: id as string,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
      }
    });
    
    // Generate invitation link using host from request
    const host = req.headers.host || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const inviteUrl = `${protocol}://${host}/accept-invite?token=${token}`;
    
    return res.json({
      inviteUrl,
      expiresAt: inviteLink.expiresAt
    });
  } catch (error) {
    console.error("Error generating invite:", error);
    return res.status(500).json({ message: "Failed to generate invitation" });
  }
});

export default router;