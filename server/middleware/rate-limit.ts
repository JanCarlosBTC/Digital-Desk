import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { log } from '../vite.js';

// Default rate limiting settings
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100; // 100 requests per window

/**
 * Creates a configurable rate limiter middleware
 * 
 * @param windowMs Time window for rate limiting in milliseconds
 * @param max Maximum number of requests per window
 * @param message Custom message to show when rate limit is exceeded
 * @returns Rate limiter middleware
 */
export const createRateLimiter = (
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX_REQUESTS,
  message = 'Too many requests, please try again later.'
) => {
  log(`Setting up rate limiter: ${max} requests per ${windowMs/60000} minutes`, 'middleware');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 429,
      message
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    
    // Custom handler for rate limiting events
    handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
      log(`Rate limit exceeded for ${req.ip} on ${req.method} ${req.url}`, 'security');
      res.status(options.statusCode).json(options.message);
    },
    
    // Skip rate limiting in development mode
    skip: (req: Request) => {
      // Force skip rate limiting in development and for Replit environments
      return process.env.NODE_ENV === 'development' || req.hostname.includes('replit.dev');
    },
    
    // Use IP address as the key by default
    keyGenerator: (req: Request) => {
      return req.ip || 'unknown';
    }
  });
};

/**
 * Standard API rate limiter (100 requests per 15 minutes)
 */
export const standardApiLimiter = createRateLimiter();

/**
 * Strict rate limiter for sensitive operations (20 requests per 15 minutes)
 */
export const strictApiLimiter = createRateLimiter(
  15 * 60 * 1000, 
  20,
  'Too many attempts, please try again after some time.'
);

/**
 * Very strict limiter for auth endpoints (5 attempts per 15 minutes)
 */
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many login attempts, please try again after 15 minutes.'
); 