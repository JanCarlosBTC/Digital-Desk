import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Extend Express.User to include our user properties
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email?: string | null;
      name: string;
      initials: string;
      isAdmin: boolean;
      lastLogin?: Date | null;
    }
  }
}

// Create Prisma client for database operations
const prisma = new PrismaClient();

// Make scrypt async
const scryptAsync = promisify(scrypt);

// Input validation schema for user
export const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  initials: z.string().min(1).max(4),
  isAdmin: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export interface UserData {
  id: string;
  username: string;
  email?: string | null;
  password: string;
  name: string;
  initials: string;
  isAdmin: boolean;
}

/**
 * Hash a password with a randomly generated salt
 */
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  if (!hashed || !salt) return false;
  
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Setup authentication for the Express application
 */
export function setupAuth(app: Express) {
  const environment = process.env.NODE_ENV || 'development';
  
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'development-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: environment === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Local Strategy for username/password authentication
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username }
      });
      
      // If user doesn't exist or password doesn't match
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      
      // Return the user
      return done(null, {
        id: user.id,
        username: user.username,
        name: user.name,
        initials: user.initials,
        email: user.email,
        isAdmin: user.isAdmin,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      return done(error);
    }
  }));
  
  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id as string }
      });
      
      if (!user) {
        return done(null, false);
      }
      
      // Return user data
      return done(null, {
        id: user.id,
        username: user.username,
        name: user.name,
        initials: user.initials,
        email: user.email,
        isAdmin: user.isAdmin,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      return done(error);
    }
  });
  
  // Login endpoint
  app.post('/api/login', (req, res, next): void => {
    // Validate login data
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: validationError.message, 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
    
    passport.authenticate('local', (err: Error, user: Express.User, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Update user's last login time (already done in the LocalStrategy but just to be sure)
        try {
          if (user.id) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() }
            });
          }
        } catch (updateError) {
          console.error('Failed to update last login time:', updateError);
          // Continue anyway
        }
        
        // Return the user without sensitive data
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          initials: user.initials,
          isAdmin: user.isAdmin,
          lastLogin: new Date()
        });
      });
      
      // This return is needed to satisfy TypeScript's control flow analysis
      // It won't be reached in practice because the req.login callback handles the response
      return;
    })(req, res, next);
  });
  
  // Register endpoint
  app.post('/api/register', async (req, res): Promise<any> => {
    try {
      // Validate the request data
      const { username, password, email, name, initials, isAdmin = false } = userSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email: email || "" }
          ]
        }
      });
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const user = await prisma.user.create({
        data: {
          id: randomBytes(16).toString('hex'),
          username,
          password: hashedPassword,
          email,
          name,
          initials: initials || name.substring(0, 2).toUpperCase(),
          isAdmin
        }
      });
      
      // Log the user in
      req.login({
        id: user.id,
        username: user.username,
        name: user.name,
        initials: user.initials,
        email: user.email,
        isAdmin: user.isAdmin
      }, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login after registration failed' });
        }
        
        // Return the user without sensitive data
        return res.status(201).json({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          initials: user.initials,
          isAdmin: user.isAdmin
        });
      });
      
      // This return is needed to satisfy TypeScript's control flow analysis
      // It won't be reached in practice because the req.login callback handles the response
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: validationError.message, 
          errors: error.errors 
        });
      }
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      return res.json({ message: 'Logged out successfully' });
    });
  });
  
  // User info endpoint
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.json({
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      initials: req.user.initials,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    });
  });
  
  // Demo user creation for development
  if (environment === 'development') {
    createDemoUserIfNeeded();
  }
}

/**
 * Create a demo user for development if none exists
 */
async function createDemoUserIfNeeded() {
  try {
    // Check if a user with the demo username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'demo' }
    });
    
    if (!existingUser) {
      // Create a demo user
      await prisma.user.create({
        data: {
          id: 'demo123',
          username: 'demo',
          password: await hashPassword('password123'),
          email: 'demo@example.com',
          name: 'Demo User',
          initials: 'DU',
          isAdmin: false
        }
      });
      console.log('Demo user created successfully');
    }
  } catch (error) {
    console.error('Failed to create demo user:', error);
  }
}