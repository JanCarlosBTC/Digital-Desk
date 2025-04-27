/**
 * Security Logging Middleware
 * 
 * This module provides functions for logging security-related events
 * including suspicious activities, authentication attempts, and potential attacks.
 * 
 * This is a critical security component that provides visibility into potential threats
 * and helps with forensic analysis in case of security incidents.
 */

import { Request } from 'express';

// Define type for log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

// Security log levels
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4
};

// Define metadata type
interface LogMetadata {
  [key: string]: string | number | boolean | undefined;
}

// Format timestamp for logging
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Set minimum log level based on environment
const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.info;

// Write to the security log file and/or console
const logToSecurity = (message: string, level: LogLevel = 'info'): void => {
  // Only log if the message's level is >= minimum level
  if (LOG_LEVELS[level] >= MIN_LOG_LEVEL) {
    const logEntry = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
    
    // In production, write to security log file. In dev, just console.log
    if (process.env.NODE_ENV === 'production') {
      // Ideally we would append to a secure log file here
      // For now, use console with [security] tag
      console.log(`[security] ${logEntry}`);
    } else {
      // Development environment - log to console
      console.log(`${new Date().toLocaleTimeString()} [security] ${level === 'critical' ? 'Security critical: ' : ''}${message}`);
    }
  }
};

/**
 * Log a security event with associated metadata
 * 
 * @param message - The log message
 * @param level - Log level: debug, info, warn, error, critical
 * @param metadata - Additional data to log 
 */
export function logSecurityEvent(message: string, level: LogLevel = 'info', metadata: LogMetadata = {}): void {
  try {
    const metadataStr = Object.keys(metadata).length > 0 
      ? ' - ' + Object.entries(metadata)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : '';
    
    logToSecurity(`${message}${metadataStr}`, level);
  } catch (error) {
    console.error('Error writing security log:', error);
  }
}

/**
 * Log suspicious activity from a request
 * 
 * @param message - Description of the suspicious activity
 * @param req - Express request object
 */
export function logSuspiciousActivity(message: string, req: Request): void {
  const metadata: LogMetadata = {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString()
  };
  
  // Add authentication information if available
  if (req.userId) {
    metadata.userId = req.userId;
  }
  
  logSecurityEvent(`Suspicious activity: ${message}`, 'warn', metadata);
}

/**
 * Log an authentication attempt with outcome
 * 
 * @param username - The username that attempted authentication 
 * @param success - Whether authentication succeeded
 * @param req - Express request object
 */
export function logAuthAttempt(username: string, success: boolean, req: Request): void {
  const outcome = success ? 'successful' : 'failed';
  
  const metadata: LogMetadata = {
    ip: req.ip,
    username,
    userAgent: req.get('user-agent') || 'unknown'
  };
  
  const level: LogLevel = success ? 'info' : 'warn';
  
  logSecurityEvent(`Authentication ${outcome} for user: ${username}`, level, metadata);
}