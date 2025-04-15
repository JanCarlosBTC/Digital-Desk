/**
 * CSRF Protection Middleware
 * 
 * This module implements CSRF protection using the double-submit cookie pattern.
 * It generates a CSRF token and sets it as both a cookie and requires it to be
 * sent in the request header for mutating operations (POST, PUT, DELETE, PATCH).
 */

import crypto from 'crypto';
import { logSecurityEvent, logSecurityViolation } from './security-logger.js';

// CSRF token cookie name
const CSRF_COOKIE_NAME = 'X-CSRF-Token';
// CSRF token header name (must match what frontend sends)
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a secure random token for CSRF protection
 * 
 * @returns {string} A random token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to set CSRF token cookie if it doesn't exist
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export function setCsrfCookie(req, res, next) {
  // Skip in development mode for easier testing
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_CSRF !== 'true') {
    return next();
  }
  
  // Check if the CSRF cookie already exists
  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    // Generate a new token
    const csrfToken = generateCsrfToken();
    
    // Set the cookie - secure in production, http-only to prevent JavaScript access
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Store in request for later use
    req.csrfToken = csrfToken;
  } else {
    // Use existing token
    req.csrfToken = req.cookies[CSRF_COOKIE_NAME];
  }
  
  // Continue to next middleware
  next();
}

/**
 * Middleware to validate CSRF token on mutating requests
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export function validateCsrfToken(req, res, next) {
  // Skip in development mode for easier testing
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_CSRF !== 'true') {
    return next();
  }
  
  // Only check for mutating operations
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (mutatingMethods.includes(req.method)) {
    const cookieToken = req.cookies && req.cookies[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()];
    
    // Both tokens must exist and match
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      // Log the security violation
      logSecurityViolation('CSRF token validation failed', req);
      
      return res.status(403).json({
        error: 'CSRF verification failed',
        message: 'Invalid security token'
      });
    }
  }
  
  // Continue to next middleware
  next();
}

/**
 * Get the current CSRF token for the request
 * Useful for sending to frontend
 * 
 * @param {object} req - Express request object
 * @returns {string} The current CSRF token
 */
export function getCsrfToken(req) {
  return req.csrfToken;
}

/**
 * Add the current CSRF token to the response as a custom header
 * This is useful for single-page applications to get the token
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export function sendCsrfToken(req, res, next) {
  // Skip in development mode
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_CSRF !== 'true') {
    return next();
  }
  
  // Add the token to the response headers
  if (req.csrfToken) {
    res.setHeader(CSRF_HEADER_NAME, req.csrfToken);
  }
  
  next();
}