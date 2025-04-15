import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that sets a CSRF token in the session and as a cookie
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction): void;

/**
 * Middleware that validates the CSRF token from the request against the session token
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void;

/**
 * Helper function that returns both middlewares as a pair
 * @returns An array of both middlewares [setCsrfToken, validateCsrfToken]
 */
export function csrfProtection(): [
  (req: Request, res: Response, next: NextFunction) => void,
  (req: Request, res: Response, next: NextFunction) => void
];