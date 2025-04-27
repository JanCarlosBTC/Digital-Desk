import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import type { User as PrismaUser } from "@prisma/client";
import logger from "./logger.js";

// Interface for our database User type
export interface UserData {
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  password: string;
  name: string;
  initials: string;
  plan?: string | null;
}

const scryptAsync = promisify(scrypt);

/**
 * Hash a password with a randomly generated salt
 */
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  // Ensure hashed is a valid string before creating a buffer
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Setup authentication for the Express application
 */
export function setupAuth(app: Express) {
  // Get a secure secret or generate one for development
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  
  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === "production") {
      logger.warn("SESSION_SECRET not set in production environment!");
    } else {
      logger.info("Using generated SESSION_SECRET for development");
    }
  }

  // Create a session store using PostgreSQL
  const PostgresSessionStore = require('connect-pg-simple')(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
  });

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure LocalStrategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          logger.warn(`Login attempt with non-existent username: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (!(await comparePasswords(password, user.password))) {
          logger.warn(`Failed login attempt for username: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        logger.info(`User logged in successfully: ${username}`);
        // Convert database user to Express User format with claims
        const expressUser = {
          id: user.id,
          username: user.username,
          name: user.name,
          initials: user.initials,
          email: user.email,
          plan: user.plan,
          claims: {
            sub: user.id,
            email: user.email,
            username: user.username,
            name: user.name
          }
        };
        return done(null, expressUser);
      } catch (error) {
        logger.error(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return done(error as Error);
      }
    }),
  );

  // Configure session serialization
  passport.serializeUser((user, done) => {
    logger.debug(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      logger.debug(`Deserialized user: ${id}`);
      if (user) {
        // Convert database user to Express User format with claims
        const expressUser = {
          id: user.id,
          username: user.username,
          name: user.name,
          initials: user.initials,
          email: user.email,
          plan: user.plan,
          claims: {
            sub: user.id,
            email: user.email,
            username: user.username,
            name: user.name
          }
        };
        done(null, expressUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      logger.error(`Deserialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      done(error as Error);
    }
  });

  // API Routes for authentication
  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, initials, plan } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        logger.warn(`Registration attempt with existing username: ${username}`);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name: name || username,
        initials: initials || username.substring(0, 2).toUpperCase(),
        plan: plan || null
      });

      logger.info(`New user registered: ${username}`);
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json({
          id: user.id,
          username: user.username,
          name: user.name,
          initials: user.initials,
          plan: user.plan
          // Exclude password and other sensitive fields
        });
      });
    } catch (error) {
      logger.error(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        logger.error(`Login error: ${err.message}`);
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          logger.error(`Session creation error: ${loginErr.message}`);
          return next(loginErr);
        }
        
        logger.info(`User logged in: ${user.username}`);
        return res.status(200).json({
          id: user.id,
          username: user.username,
          name: user.name,
          initials: user.initials,
          plan: user.plan
          // Exclude password and other sensitive fields
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    if (req.user) {
      logger.info(`User logged out: ${(req.user as Express.User).username}`);
    }
    
    req.logout((err) => {
      if (err) return next(err);
      return res.sendStatus(200);
    });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as Express.User;
    return res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      initials: user.initials,
      plan: user.plan
      // Exclude password and other sensitive fields
    });
  });

  // Development-only middleware to set a default user ID for testing
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      if (!req.isAuthenticated() && req.path.startsWith('/api/')) {
        logger.debug(`[auth] [DEV] Using default userId='1' for request to ${req.path}`);
        (req as any).user = { 
          id: '1',
          username: 'dev_user',
          name: 'Development User',
          initials: 'DU',
          plan: 'free'
        };
      }
      next();
    });
  }
}