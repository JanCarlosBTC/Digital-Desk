import { Router } from 'express';
import { isAuthenticated } from './replitAuth.js';
import { authStorage } from './prisma-replit-auth.js';

const router = Router();

// Endpoint to get the current authenticated user
router.get('/auth/user', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await authStorage.getUser(userId);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user information" });
  }
});

export default router;