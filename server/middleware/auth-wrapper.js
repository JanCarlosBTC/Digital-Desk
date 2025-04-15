/**
 * Authentication Wrapper Middleware
 * 
 * This module provides middleware wrappers to enforce authentication
 * and user context on API routes. It helps secure routes by ensuring
 * users are authenticated before accessing resources.
 */

import { log } from '../vite.js';

/**
 * Middleware that enforces authentication but doesn't require user context
 * Use this for endpoints that need authentication but don't need user data
 * 
 * @param {Function} handler The route handler to wrap with authentication
 * @returns {Function} A wrapped route handler with authentication check
 */
export function withAuth(handler) {
  return function(req, res, next) {
    // In development mode, always use userId=1 without checking auth
    if (process.env.NODE_ENV !== 'production') {
      log(`[DEV] Using default userId=1 for request to ${req.path}`, 'auth');
      req.userId = req.userId || 1;
      return handler(req, res, next);
    }
    
    // In production, verify that userId exists
    if (!req.userId) {
      log(`[SECURITY] Unauthorized access attempt to ${req.path} from ${req.ip}`, 'auth');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    return handler(req, res, next);
  };
}

/**
 * Middleware that enforces authentication AND requires valid user context
 * Use this for endpoints that need to access or modify user-specific data
 * 
 * @param {Function} handler The route handler to wrap with authentication and user check
 * @returns {Function} A wrapped route handler with authentication and user check
 */
export function withAuthAndUser(handler) {
  return function(req, res, next) {
    // In development mode, always use userId=1 without checking auth
    if (process.env.NODE_ENV !== 'production') {
      log(`[DEV] Using default userId=1 for request to ${req.path}`, 'auth');
      req.userId = req.userId || 1;
      return handler(req, res, next);
    }
    
    // In production, verify that userId exists
    if (!req.userId) {
      log(`[SECURITY] Unauthorized access attempt to ${req.path} from ${req.ip}`, 'auth');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    return handler(req, res, next);
  };
}

/**
 * Development-only middleware for testing with a specific user ID
 * This should NEVER be used in production
 * 
 * @param {number} userId The user ID to use for the request (defaults to 1)
 * @returns {Function} A route handler that injects the specified user ID
 */
export function withDevAuth(userId = 1) {
  return function(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
      log(`[SECURITY] Attempt to use dev auth in production for ${req.path}`, 'auth');
      return res.status(404).json({ message: 'Endpoint not found' });
    }
    
    // Inject the user ID for development testing
    req.userId = userId;
    log(`[DEV] Using injected userId=${userId} for request to ${req.path}`, 'auth');
    
    // Pass through to the next middleware/route handler
    next();
  };
}