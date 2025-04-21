import { Request, Response, NextFunction } from 'express';
import { log } from '../vite.js';
import helmet from 'helmet';

/**
 * Security headers middleware using Helmet
 * This sets various HTTP headers to help protect against common web vulnerabilities
 */
export const securityHeaders = helmet({
  // Control cross-domain policies
  crossOriginResourcePolicy: { policy: 'same-origin' },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Set strict Content-Security-Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    }
  },
  // Enable XSS protection
  xssFilter: true
});

/**
 * Request sanitization middleware
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  // Function to sanitize strings recursively in objects
  const sanitize = (obj: any): any => {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      // Basic sanitization - remove script tags and potentially harmful content
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, 'blocked:')
        .replace(/on\w+=/gi, 'blocked=');
    }
    
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }
      
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  // Sanitize both body and query params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
}

/**
 * Simple brute force protection middleware
 * This tracks failed requests and can temporarily block IPs with too many failures
 */
export function bruteForceProtection(
  windowMs = 15 * 60 * 1000, // 15 minutes
  maxFailures = process.env.NODE_ENV === 'development' ? 50 : 5, // Increase limit for development/demo
  blockDuration = process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 30 * 60 * 1000 // 1 minute in dev, 30 in prod
) {
  // In-memory storage of failed attempts (should use Redis in production)
  const failedAttempts: Record<string, { count: number, blockedUntil?: number }> = {};
  
  // Clean up old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of Object.entries(failedAttempts)) {
      if (data.blockedUntil && data.blockedUntil < now) {
        delete failedAttempts[ip];
      }
    }
  }, 60 * 1000); // Clean up every minute
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip for Replit environments
    if (req.hostname.includes('replit.dev')) {
      return next();
    }
    
    const ip = req.ip || 'unknown';
    const now = Date.now();
    
    // If IP is not in our records, initialize it
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 0 };
    }
    
    const attempt = failedAttempts[ip];
    
    // Check if IP is currently blocked
    if (attempt.blockedUntil && attempt.blockedUntil > now) {
      const remaining = Math.ceil((attempt.blockedUntil - now) / 1000 / 60);
      res.status(429).json({
        message: `Too many failed attempts. Please try again after ${remaining} minutes.`
      });
      return;
    }
    
    // Middleware to track failed responses for this request
    res.on('finish', () => {
      // If the response status indicates failure (4xx)
      if (res.statusCode >= 400 && res.statusCode < 500) {
        attempt.count += 1;
        
        if (attempt.count >= maxFailures) {
          attempt.blockedUntil = now + blockDuration;
          log(`IP ${ip} has been blocked due to too many failed attempts`, 'security');
        }
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        // Reset counter on successful requests
        attempt.count = 0;
      }
    });
    
    next();
  };
} 