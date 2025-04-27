import passport from "passport";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type for the authenticated request with user
export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to check if the user is authenticated
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // In development mode, bypass authentication for easier testing
  if (process.env.NODE_ENV !== 'production') {
    // Add a personal user account to the request
    (req as any).user = {
      id: "personal123",
      username: "v4yl1n",
      email: "v4yl1n@gmail.com",
      name: "V4YL1N",
      initials: "V4",
      plan: "Pro"
    };
    return next();
  }
  
  // In production, check if the user is authenticated
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
}

// Setup auth for the Express app
export async function setupAuth(app: Express) {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-not-for-production",
    resave: false,
    saveUninitialized: false
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Set up serialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });
  
  // Login route - redirects to Replit Auth
  app.get("/api/login", (req, res) => {
    // In production, this would redirect to Replit OAuth
    // For now, we'll redirect to a mock login page
    res.redirect("/login");
  });
  
  // Callback route that would normally process the OAuth response
  app.get("/api/callback", (req, res) => {
    res.redirect("/");
  });
  
  // Logout route
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
  
  console.log("Auth routes configured (simplified implementation)");
}