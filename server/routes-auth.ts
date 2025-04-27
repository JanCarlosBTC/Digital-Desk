import { Router } from 'express';
import type { Response, Request } from 'express';
import { isAuthenticated, AuthenticatedRequest } from './replitAuth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Endpoint to get the current authenticated user
router.get('/user', isAuthenticated, async (req: Request, res: Response) => {
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

// Login endpoint to start the auth flow
router.get('/login', (req: Request, res: Response) => {
  // In a production Replit Auth implementation, this would redirect to OAuth
  // For now, we'll just redirect to the login page
  res.redirect('/login');
});

// Logout endpoint
router.get('/logout', (req: Request, res: Response) => {
  if (req.logout) {
    req.logout(() => {
      res.redirect('/login');
    });
  } else {
    // Fallback if req.logout is not available
    res.redirect('/login');
  }
});

export default router;