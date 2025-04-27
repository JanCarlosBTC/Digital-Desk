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
import { logSecurityEvent } from './security-logger.js';

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

// Default configuration
const DEFAULT_COOKIE_NAME = 'csrf-token';
const DEFAULT_HEADER_NAME = 'X-CSRF-TOKEN';

/**
 * Sets a CSRF cookie for use in Double Submit Cookie pattern
 */
export const setCsrfCookie = (req: Request, res: Response, next: NextFunction): void => {
  // Configure CSRF cookie settings
  const secureCookie = process.env.NODE_ENV === 'production';
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: secureCookie,
    path: '/'
  };
  
  // Check for existing token in cookie or generate a new one
  let token = req.cookies && req.cookies[DEFAULT_COOKIE_NAME];
  
  if (!token) {
    token = generateToken();
    res.cookie(DEFAULT_COOKIE_NAME, token, cookieOptions);
  }
  
  // Expose a method to get the token from the request
  req.csrfToken = () => token;
  
  next();
};

/**
 * Validates the CSRF token in the request header against the cookie value
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Skip CSRF check for non-mutating requests
  if (!requiresValidation(req)) {
    return next();
  }
  
  // Get token from request header and cookie
  const requestToken = req.headers[DEFAULT_HEADER_NAME.toLowerCase()] as string | undefined;
  const cookieToken = req.cookies && req.cookies[DEFAULT_COOKIE_NAME];
  
  // Validate token
  if (!requestToken || !cookieToken || requestToken !== cookieToken) {
    // Log potential CSRF attack
    logSecurityEvent('CSRF validation failed', 'error', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent') || 'unknown',
      cookieToken: !!cookieToken,
      headerToken: !!requestToken
    });
    
    return res.status(403).json({
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token'
    });
  }
  
  next();
};

/**
 * Additional middleware to expose CSRF token to client applications
 */
export const sendCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Add CSRF token to response headers for client access
  if (req.csrfToken) {
    res.setHeader('X-CSRF-TOKEN', req.csrfToken());
  }
  next();
};

/**
 * Full CSRF Protection Middleware (original implementation)
 * 
 * @param options Configuration options
 * @param options.cookieName Name of the cookie to use (default: 'csrf-token')
 * @param options.headerName Name of the header to check (default: 'X-CSRF-TOKEN')
 * @param options.ignorePaths Paths to ignore CSRF check (default: [])
 * @returns Express middleware function
 */
const csrfProtection = (options: CsrfOptions = {}) => {
  const {
    cookieName = DEFAULT_COOKIE_NAME,
    headerName = DEFAULT_HEADER_NAME,
    ignorePaths = []
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void | Response => {
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
};

// Export both the individual middlewares and the full protection function
export { csrfProtection };
export default csrfProtection;