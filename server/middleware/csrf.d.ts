import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to set a CSRF token cookie if one doesn't exist
 */
export function setCsrfCookie(req: Request, res: Response, next: NextFunction): void;

/**
 * Middleware to validate CSRF tokens on mutating requests (POST, PUT, DELETE, PATCH)
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void;

/**
 * Get the current CSRF token for the request
 * @param req Request object
 * @returns The current CSRF token
 */
export function getCsrfToken(req: Request): string;

/**
 * Add the CSRF token to response headers for SPA applications
 */
export function sendCsrfToken(req: Request, res: Response, next: NextFunction): void;