/**
 * Authentication Middleware Wrapper
 * 
 * A secure middleware layer that extracts the authenticated user ID from the request
 * and provides it to API route handlers, eliminating hardcoded user IDs.
 */

import { authenticate } from './auth.js';

/**
 * Creates an authenticated route handler for APIs that require authentication
 * 
 * @param {Function} handler - The original route handler function 
 * @returns {Function} A wrapped handler that includes authentication
 */
export const withAuth = (handler) => {
  return (req, res, next) => {
    // First authenticate the request
    authenticate(req, res, (err) => {
      if (err) return next(err);
      
      // If authentication failed, the authenticate middleware would have
      // already sent the appropriate response
      if (!req.userId) return;
      
      // Call the original handler with the authenticated request
      return handler(req, res, next);
    });
  };
};

/**
 * Creates a wrapper around an API endpoint to add authentication
 * and inject the user ID from the authenticated token instead of using hardcoded IDs
 * 
 * @param {Function} handler - The original API handler function
 * @returns {Function} A wrapped handler that includes authentication and user ID injection
 */
export const withAuthAndUser = (handler) => {
  return withAuth((req, res, next) => {
    // Override any user ID in the request body with the authenticated user ID
    if (req.body && typeof req.body === 'object') {
      req.body.userId = req.userId;
    }
    
    // Continue to the original handler
    return handler(req, res, next);
  });
};

/**
 * Development-only middleware that simulates authentication
 * Only for use in development environments
 * 
 * @param {number} userId - The user ID to simulate
 * @returns {Function} Middleware function
 */
export const withDevAuth = (userId = 1) => {
  return (req, res, next) => {
    // SECURITY CHECK: Only allow in development
    if (process.env.NODE_ENV === 'production') {
      console.error('Attempt to use development authentication in production');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Inject the user ID
    req.userId = userId;
    
    // Log the use of development authentication
    console.warn(`[SECURITY] Using development authentication (userId: ${userId})`);
    
    // Continue
    return next();
  };
};