import { Router } from 'express';
import type { Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from './replitAuth.js';
import { authStorage } from './prisma-replit-auth.js';

const router = Router();

// Endpoint to get the current authenticated user
router.get('/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.claims.sub;
    const user = await authStorage.getUser(userId);
    return res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Failed to fetch user information" });
  }
});

export default router;