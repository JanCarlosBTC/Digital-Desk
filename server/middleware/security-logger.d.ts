import { Request } from 'express';

export function logSecurityEvent(message: string, level?: string, metadata?: Record<string, any>): void;
export function logSuspiciousActivity(message: string, req: Request): void;
export function logAuthAttempt(username: string, success: boolean, req: Request): void;