import { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { loggerMiddleware } from './logger.js';
import { errorHandlerMiddleware } from './errorHandler.js';
import { hostBypassMiddleware } from './host-bypass.js';
import { log } from '../vite.js';

/**
 * Registers all middleware components with the Express application
 * This ensures consistent middleware ordering and configuration
 * 
 * @param app Express application instance
 */
export function setupMiddleware(app: Express): void {
  // Basic middleware setup
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Custom middleware components
  app.use(hostBypassMiddleware);
  app.use(loggerMiddleware);
  
  // Session configuration - applied after core middleware
  setupSession(app);
  
  // Error handler - must be last
  app.use(errorHandlerMiddleware);
  
  log('All middleware configured successfully', 'middleware');
}

/**
 * Configures session middleware with security best practices
 * 
 * @param app Express application instance
 */
function setupSession(app: Express): void {
  // Session configuration
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'digital-desk-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };
  
  // For simplicity in this initial implementation, we'll use the default memory store
  // Note: In production, you should use a persistent store like Redis or PostgreSQL
  if (process.env.NODE_ENV === 'production') {
    log('Warning: Using memory session store in production - consider implementing a persistent store', 'middleware');
  } else {
    log('Memory session store configured for development', 'middleware');
  }
  
  // Apply session middleware
  app.use(session(sessionOptions));
}