/**
 * Authentication Wrapper Middleware (Authentication Removed)
 * 
 * This module provides default middleware wrappers with authentication removed.
 * All routes now use a fixed demo user ID.
 */

import { Request, Response, NextFunction } from 'express';
import { log } from '../vite.js';

// Define handler function type
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

/**
 * Simplified middleware that always uses a demo user ID
 * 
 * @param handler The route handler to wrap
 * @returns A wrapped route handler
 */
export function withAuth(handler: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    // Always use userId=1 (demo user) for all environments
    log(`Using default userId=1 for request to ${req.path}`, 'auth');
    req.userId = 1;
    return handler(req, res, next);
  };
}

/**
 * Simplified middleware that always uses a demo user ID
 * 
 * @param handler The route handler to wrap
 * @returns A wrapped route handler
 */
export function withAuthAndUser(handler: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
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
 * @param userId The user ID parameter is ignored
 * @returns A route handler that injects the demo user ID
 */
export function withDevAuth(userId: number = 1): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    // Always use userId=1 regardless of parameter
    req.userId = 1;
    log(`Using demo userId=1 for request to ${req.path}`, 'auth');
    
    // Pass through to the next middleware/route handler
    next();
  };
}