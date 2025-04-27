import { Router } from 'express';
import type { Response, Request } from 'express';
import { isAuthenticated, AuthenticatedRequest } from './replitAuth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Endpoint to get the current authenticated user
router.get('/auth/user', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // For now, always return a placeholder demo user since 
    // we're not implementing the full Replit Auth flow
    const demoUser = {
      id: "demo123",
      username: "demo",
      email: "demo@example.com",
      name: "Demo User",
      initials: "DU",
      plan: "Free",
      isAuthenticated: true
    };
    
    return res.json(demoUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Failed to fetch user information" });
  }
});

// Just redirect auth login to the main login endpoint
router.get('/auth/login', (req: Request, res: Response) => {
  res.redirect('/api/login');
});

// Just redirect auth logout to the main logout endpoint
router.get('/auth/logout', (req: Request, res: Response) => {
  res.redirect('/api/logout');
});

export default router;