/**
 * CSRF Protection Middleware
 * 
 * This middleware implements Cross-Site Request Forgery (CSRF) protection
 * for state-changing operations (POST, PUT, DELETE).
 * 
 * It uses a double-submit cookie pattern: a CSRF token is stored in both a cookie
 * and sent to the client for inclusion in request headers or form submissions.
 */

import crypto from 'crypto';

// Token name constants
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

/**
 * Generates a secure random token for CSRF protection
 * @returns {string} A random token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sets a CSRF token in the response cookies and makes it available to the client
 */
export function setCsrfToken(req, res, next) {
  // Create a new token if one doesn't exist
  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    
    // Set the cookie with appropriate security settings
    res.cookie(CSRF_COOKIE_NAME, token, {
      sameSite: 'strict',  // Prevent CSRF
      httpOnly: false,     // Client JS needs to read this
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      path: '/',           // Available across the application
    });
  }
  
  next();
}

/**
 * Validates the CSRF token from the request header against the cookie value
 * for all state-changing methods (POST, PUT, DELETE)
 */
export function validateCsrfToken(req, res, next) {
  // Skip validation for non-state-changing methods
  const safeMethod = /^(GET|HEAD|OPTIONS|TRACE)$/.test(req.method);
  if (safeMethod) {
    return next();
  }
  
  // Skip for development environment if enabled
  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_CSRF === 'true') {
    console.warn('[SECURITY] CSRF protection disabled in development mode');
    return next();
  }
  
  // Get the token from the cookie
  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : null;
  
  // Get the token from the request header
  const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] || req.headers[CSRF_HEADER_NAME] || 
    req.body && req.body._csrf;
  
  // Both tokens must exist and match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.error(`[SECURITY] CSRF validation failed: token mismatch or missing for ${req.method} ${req.path}`);
    return res.status(403).json({ message: 'CSRF token validation failed' });
  }
  
  next();
}

/**
 * Creates middleware that sets and validates CSRF tokens
 * @returns {Array} Array of middleware functions to handle CSRF protection
 */
export function csrfProtection() {
  return [setCsrfToken, validateCsrfToken];
}