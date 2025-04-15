/**
 * CSRF Protection Middleware
 * 
 * This middleware implements Cross-Site Request Forgery protection
 * through the double-submit cookie pattern with a CSRF token.
 */

import crypto from 'crypto';

// Generate a random CSRF token
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Set the CSRF token as cookie and expose it in response header
export function setCsrfToken(req, res, next) {
  // Skip for GET, HEAD, OPTIONS methods (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Generate a new token if one doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  
  // Set token in cookie (httpOnly: false so JS can read it)
  res.cookie('csrf-token', req.session.csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  // Also add it as a response header for API clients
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  
  next();
}

// Validate the CSRF token from request against the session token
export function validateCsrfToken(req, res, next) {
  // Skip for GET, HEAD, OPTIONS methods (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_CSRF !== 'true') {
    return next();
  }
  
  // Get the token from header, body, or query
  const clientToken = 
    req.headers['x-csrf-token'] || 
    req.body._csrf || 
    req.query._csrf;
  
  // No token provided
  if (!clientToken) {
    console.warn(`[SECURITY] CSRF token missing in request from ${req.ip}`);
    return res.status(403).json({ 
      message: 'CSRF token required',
      error: 'CSRF_TOKEN_MISSING'
    });
  }
  
  // No session token for comparison
  if (!req.session.csrfToken) {
    console.warn(`[SECURITY] No CSRF token in session for request from ${req.ip}`);
    return res.status(403).json({ 
      message: 'CSRF validation failed',
      error: 'CSRF_SESSION_EXPIRED'
    });
  }
  
  // Token mismatch
  if (clientToken !== req.session.csrfToken) {
    console.warn(`[SECURITY] CSRF token mismatch for request from ${req.ip}`);
    return res.status(403).json({ 
      message: 'CSRF validation failed',
      error: 'CSRF_TOKEN_INVALID'
    });
  }
  
  // Success - continue to the route handler
  next();
}

// Helper function to create both middlewares as a pair
export function csrfProtection() {
  return [setCsrfToken, validateCsrfToken];
}