import { Router } from 'express';
import type { Response, Request } from 'express';
import { isAuthenticated, AuthenticatedRequest } from './replitAuth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Endpoint to get the current authenticated user
router.get('/user', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // The user should be provided by the isAuthenticated middleware
    // We can just return the user object from the request
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: "No user found" });
    }
    
    return res.json({
      ...user,
      isAuthenticated: true
    });
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