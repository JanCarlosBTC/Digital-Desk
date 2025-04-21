/**
 * Authentication Wrapper Middleware (Authentication Removed)
 * 
 * This module provides default middleware wrappers with authentication removed.
 * All routes now use a fixed demo user ID.
 */

import { log } from '../vite.js';

/**
 * Simplified middleware that always uses a demo user ID
 * 
 * @param {Function} handler The route handler to wrap
 * @returns {Function} A wrapped route handler
 */
export function withAuth(handler) {
  return function(req, res, next) {
    // Always use userId=1 (demo user) for all environments
    log(`Using default userId=1 for request to ${req.path}`, 'auth');
    req.userId = 1;
    return handler(req, res, next);
  };
}

/**
 * Simplified middleware that always uses a demo user ID
 * 
 * @param {Function} handler The route handler to wrap
 * @returns {Function} A wrapped route handler
 */
export function withAuthAndUser(handler) {
  return function(req, res, next) {
    // Always use userId=1 (demo user) for all environments
    log(`Using default userId=1 for request to ${req.path}`, 'auth');
    req.userId = 1;
    return handler(req, res, next);
  };
}

/**
 * Development compatibility middleware that maintains the same API
 * but always uses a fixed user ID
 * 
 * @param {number} userId The user ID parameter is ignored
 * @returns {Function} A route handler that injects the demo user ID
 */
export function withDevAuth(userId = 1) {
  return function(req, res, next) {
    // Always use userId=1 regardless of parameter
    req.userId = 1;
    log(`Using demo userId=1 for request to ${req.path}`, 'auth');
    
    // Pass through to the next middleware/route handler
    next();
  };
}