import type { Express } from "express";
import prisma from "./prisma.js";
import { setupAuth, isAuthenticated } from "./replitAuth.js";

export async function registerAuthRoutes(app: Express) {
  // Set up the Replit Auth routes and middleware
  await setupAuth(app);
  
  // Protected route to get the current user's information
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Example protected route
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    res.json({ 
      message: "This is a protected route", 
      user: req.user.claims 
    });
  });
}