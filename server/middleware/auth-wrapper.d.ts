import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that enforces authentication but doesn't require user context
 * Use this for endpoints that need authentication but don't need user data
 * 
 * @param handler The route handler to wrap with authentication
 */
export function withAuth<T>(
  handler: (req: Request, res: Response, next: NextFunction) => T
): (req: Request, res: Response, next: NextFunction) => T;

/**
 * Middleware that enforces authentication AND requires valid user context
 * Use this for endpoints that need to access or modify user-specific data
 * 
 * @param handler The route handler to wrap with authentication and user check
 */
export function withAuthAndUser<T>(
  handler: (req: Request, res: Response, next: NextFunction) => T
): (req: Request, res: Response, next: NextFunction) => T;

/**
 * Development-only middleware for testing with a specific user ID
 * This should NEVER be used in production
 * 
 * @param userId The user ID to use for the request (defaults to 1)
 */
export function withDevAuth(
  userId?: number
): (req: Request, res: Response, next: NextFunction) => void;