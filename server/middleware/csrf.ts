/**
 * CSRF Protection Middleware
 * 
 * This middleware provides Cross-Site Request Forgery (CSRF) protection by
 * implementing the Double Submit Cookie pattern. It issues a CSRF token as a
 * cookie and requires that token to be submitted with non-GET requests.
 * 
 * For maximum security, use this with SameSite=Strict cookies and HTTPS.
 */

import crypto from 'crypto';
import { Request, Response, NextFunction, CookieOptions } from 'express';
import { logSecurityEvent } from './security-logger';

// Define options interface
interface CsrfOptions {
  cookieName?: string;
  headerName?: string;
  ignorePaths?: string[];
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      csrfToken: () => string;
    }
  }
}

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Check if a request requires CSRF validation
const requiresValidation = (req: Request): boolean => {
  const method = req.method.toUpperCase();
  // Validate POST, PUT, PATCH and DELETE requests
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
};

/**
 * CSRF Protection Middleware
 * 
 * @param options Configuration options
 * @param options.cookieName Name of the cookie to use (default: 'csrf-token')
 * @param options.headerName Name of the header to check (default: 'X-CSRF-TOKEN')
 * @param options.ignorePaths Paths to ignore CSRF check (default: [])
 * @returns Express middleware function
 */
function csrfProtection(options: CsrfOptions = {}) {
  const {
    cookieName = 'csrf-token',
    headerName = 'X-CSRF-TOKEN',
    ignorePaths = []
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Configure CSRF cookie settings
    const secureCookie = process.env.NODE_ENV === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: secureCookie,
      path: '/'
    };
    
    // Check for existing token in cookie or generate a new one
    let token = req.cookies && req.cookies[cookieName];
    
    if (!token) {
      token = generateToken();
      res.cookie(cookieName, token, cookieOptions);
    }
    
    // Expose a method to get the token from the request
    req.csrfToken = () => token;
    
    // Skip CSRF check for ignored paths or non-mutating requests
    const shouldSkip = !requiresValidation(req) || 
                      ignorePaths.some(path => req.path.startsWith(path));
                      
    if (shouldSkip) {
      return next();
    }
    
    // Get token from request header
    const headerNameLower = headerName.toLowerCase();
    const requestToken = req.headers[headerNameLower] as string | undefined;
    
    // Validate token
    if (!requestToken || requestToken !== token) {
      // Log potential CSRF attack
      logSecurityEvent('CSRF validation failed', 'error', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent') || 'unknown',
        cookieToken: !!token,
        headerToken: !!requestToken
      });
      
      return res.status(403).json({
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token'
      });
    }
    
    next();
  };
}

export default csrfProtection;