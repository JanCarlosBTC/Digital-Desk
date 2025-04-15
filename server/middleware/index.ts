import { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { loggerMiddleware } from './logger.js';
import { errorHandlerMiddleware } from './errorHandler.js';
import { hostBypassMiddleware } from './host-bypass.js';
import { standardApiLimiter } from './rate-limit.js';
import { securityHeaders, sanitizeInput, bruteForceProtection } from './security.js';
import { securityMonitoring } from './monitoring.js';
// Temporarily disable CSRF until the build system can compile it
// import { csrfProtection } from './csrf.js';
import { log } from '../vite.js';

/**
 * Registers all middleware components with the Express application
 * This ensures consistent middleware ordering and configuration
 * 
 * @param app Express application instance
 */
export function setupMiddleware(app: Express): void {
  // Apply security headers first (before any response is sent)
  app.use(securityHeaders);
  
  // Basic middleware setup
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://digital-desk.app'] 
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };
  
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' })); // Limit payload size
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Security monitoring (before rate limiting so we can monitor all requests)
  app.use(securityMonitoring);
  
  // Global brute force protection
  app.use(bruteForceProtection());
  
  // Apply global rate limiting to all requests
  // This provides basic protection against DoS attacks
  app.use(standardApiLimiter);
  
  // Sanitize all input data
  app.use(sanitizeInput);
  
  // Custom middleware components
  app.use(hostBypassMiddleware);
  app.use(loggerMiddleware);
  
  // Session configuration - must be before CSRF
  setupSession(app);
  
  // Apply CSRF protection for state-changing operations
  // This must be after session setup but before routes
  try {
    // Import statically to avoid await in non-async function
    // We've moved the error handling into a try/catch to safely handle
    // any missing modules during development/compilation
    let csrfMiddleware;
    try {
      csrfMiddleware = require('./csrf.js');
    } catch (error) {
      // Type assertion to handle unknown error type
      const importError = error as Error;
      console.error('Could not import CSRF middleware:', importError.message);
      log('CSRF protection module could not be loaded, will be enabled soon', 'middleware');
      // Continue without CSRF protection
      return;
    }
    
    const { setCsrfCookie, validateCsrfToken, sendCsrfToken } = csrfMiddleware;
    
    if (process.env.NODE_ENV === 'production') {
      // In production, always apply CSRF protection
      app.use(setCsrfCookie);
      app.use(validateCsrfToken);
      app.use(sendCsrfToken);
      log('CSRF protection enabled in production mode', 'middleware');
    } else {
      // In development, make it optional based on environment variable
      if (process.env.ENABLE_CSRF === 'true') {
        app.use(setCsrfCookie);
        app.use(validateCsrfToken);
        app.use(sendCsrfToken);
        log('CSRF protection enabled in development mode', 'middleware');
      } else {
        log('CSRF protection disabled in development mode', 'middleware');
      }
    }
  } catch (error) {
    // In case there's a compilation or import error, fall back safely
    console.error('Failed to set up CSRF protection:', error);
    log('CSRF protection failed to initialize. Will be implemented soon.', 'middleware');
  }
  
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
      maxAge: 24 * 60 * 60 * 1000, // 24 hours,
      sameSite: 'lax' // Provides CSRF protection
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