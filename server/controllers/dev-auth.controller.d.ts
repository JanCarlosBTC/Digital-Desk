import { Request, Response } from 'express';

/**
 * Development-only login endpoint
 * This endpoint should only be used in development environments
 * for testing and debugging purposes.
 */
export function devLogin(req: Request, res: Response): Promise<void>;

/**
 * Development-only register endpoint
 * This endpoint should only be used in development environments
 * for creating test accounts.
 */
export function devRegister(req: Request, res: Response): Promise<void>;

/**
 * Development-only user impersonation
 * This endpoint should only be used in development environments
 * to test application behavior with different user contexts.
 */
export function devImpersonate(req: Request, res: Response): Promise<void>;