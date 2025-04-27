import * as client from "openid-client";
import { Strategy } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { PrismaClient } from '@prisma/client';
import prisma from "./prisma.js";
import { storage } from "./prisma-storage-replit.js";

// Add missing types to PrismaClient
declare global {
  namespace PrismaJson {
    type PrismaClientOptions = any;
    type DefaultArgs = any;
  }
}

// Extend PrismaClient to include workspaceInvitation
declare module '@prisma/client' {
  interface PrismaClient {
    workspaceInvitation: {
      findFirst: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
    }
  }
}

// Extend Express namespace to add our custom User type
declare global {
  namespace Express {
    interface User {
      claims: {
        sub: string;
        [key: string]: any;
      };
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      [key: string]: any;
    }
  }
}

// Extended Request type with proper user property typing
export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

// Define the verify callback type
type VerifyCallback = (
  err: Error | null,
  user?: any,
  info?: any
) => void;

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// Use memoize to cache the OpenID Connect configuration
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 } // Cache for 1 hour
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Admin access configuration
const ADMIN_USERNAME = "agiledev_agent"; 
const ADMIN_EMAIL = "v4yl1n@gmail.com"; // Added specific email for admin

async function upsertUser(claims: any) {
  const user = await storage.getUser(claims.sub);
  
  if (user) {
    // Update existing user with potentially new admin status
    const isAdmin = 
      claims.username === ADMIN_USERNAME || 
      claims.email === ADMIN_EMAIL;
    
    return await prisma.user.update({
      where: { id: claims.sub },
      data: {
        username: claims.username,
        email: claims.email,
        // Update role if this user has admin privileges
        role: isAdmin ? "ADMIN" : user.role,
        // Fields that currently exist in the schema
        name: claims.first_name || claims.username,
        initials: claims.first_name ? claims.first_name.charAt(0) + (claims.last_name ? claims.last_name.charAt(0) : '') : claims.username.charAt(0)
      }
    });
  } else {
    // Check if this is first user or admin
    const isAdmin = 
      claims.username === ADMIN_USERNAME || 
      claims.email === ADMIN_EMAIL || 
      await prisma.user.count() === 0;
    
    const role = isAdmin ? "ADMIN" : "CLIENT";
    
    // Create new user first without workspace assignment
    const newUser = await storage.createUser({
      id: claims.sub,
      username: claims.username,
      password: "",
      email: claims.email,
      firstName: claims.first_name,
      lastName: claims.last_name,
      profileImageUrl: claims.profile_image_url,
      // Fields that currently exist in the schema
      name: claims.first_name || claims.username,
      initials: claims.first_name ? claims.first_name.charAt(0) + (claims.last_name ? claims.last_name.charAt(0) : '') : claims.username.charAt(0),
      plan: "Free",
      role
    });
    
    // If user has email, check for pending invitations
    if (claims.email) {
      // Use dynamic property access to avoid TypeScript errors
      // This is a workaround for missing types in the Prisma client
      const workspaceInvitationModel = (prisma as any).workspaceInvitation;
      
      // Using any type to bypass TypeScript checking
      const pendingInvitation = workspaceInvitationModel && await workspaceInvitationModel.findFirst({
        where: {
          email: claims.email,
          status: "PENDING",
          expiresAt: {
            gte: new Date() // Not expired
          }
        },
        include: {
          workspace: true
        }
      });
      
      if (pendingInvitation) {
        // Assign user to the invited workspace
        await prisma.user.update({
          where: { id: newUser.id },
          data: {
            workspaceId: pendingInvitation.workspaceId
          }
        });
        
        // Update invitation status using dynamic access
        await workspaceInvitationModel.update({
          where: { id: pendingInvitation.id },
          data: {
            status: "ACCEPTED"
          }
        });
        
        console.log(`User ${newUser.username} accepted workspace invitation for ${pendingInvitation.workspace.name}`);
        return newUser;
      }
    }
    
    // If admin, check if default workspace exists, if not create it
    if (role === "ADMIN") {
      const workspace = await prisma.workspace.findFirst();
      if (!workspace) {
        // Create default workspace
        await prisma.workspace.create({
          data: {
            name: "Default Workspace",
            description: "Default workspace for all users",
            createdBy: newUser.id,
            isActive: true
          }
        });
      }
    } else if (role === "CLIENT" && !newUser.workspaceId) {
      // For clients without workspace assignment (no invitation), create their own workspace
      const clientWorkspace = await prisma.workspace.create({
        data: {
          name: `${claims.username}'s Workspace`,
          description: `Workspace for ${claims.username}`,
          createdBy: newUser.id,
          isActive: true
        }
      });
      
      // Assign user to this workspace
      await prisma.user.update({
        where: { id: newUser.id },
        data: {
          workspaceId: clientWorkspace.id
        }
      });
    }

    return newUser;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: any = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    done: VerifyCallback
  ) => {
    try {
      const userObj = {};
      updateUserSession(userObj, tokens);
      await upsertUser(tokens.claims());
      done(null, userObj);
    } catch (error) {
      console.error("Error during authentication:", error);
      done(error as Error);
    }
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Type-safe authentication middleware
export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user || !req.user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= req.user.expires_at) {
    return next();
  }

  const refreshToken = req.user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(req.user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};