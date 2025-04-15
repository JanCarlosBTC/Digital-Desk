import { Request } from 'express';

/**
 * Log a security event with special formatting
 * 
 * @param message The security message to log
 * @param level The severity level: 'info', 'warn', 'error', 'critical' 
 * @param meta Additional metadata about the event
 */
export function logSecurityEvent(message: string, level?: 'info' | 'warn' | 'error' | 'critical', meta?: Record<string, any>): void;

/**
 * Log an authentication attempt (success or failure)
 * 
 * @param success Whether the authentication succeeded
 * @param username The username that attempted to authenticate  
 * @param ip The IP address of the client
 * @param userAgent The user agent string
 * @param reason The reason for failure (if applicable)
 */
export function logAuthAttempt(success: boolean, username: string, ip: string, userAgent: string, reason?: string | null): void;

/**
 * Log suspicious activity that might indicate a security issue
 * 
 * @param activity Description of the suspicious activity
 * @param request Express request object
 */
export function logSuspiciousActivity(activity: string, request: Request): void;

/**
 * Log a security violation (confirmed security issue)
 * 
 * @param violation Description of the security violation
 * @param request Express request object
 */
export function logSecurityViolation(violation: string, request: Request): void;