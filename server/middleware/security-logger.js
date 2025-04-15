/**
 * Security Logging Middleware
 * 
 * This module provides specialized logging for security-related events,
 * with different output formats based on the environment (development vs production).
 * In production, logs are written to a security log file for external monitoring.
 */

import fs from 'fs';
import path from 'path';
import { log } from '../vite.js';

// Set up log file path
const LOG_DIR = path.resolve('./logs');
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

/**
 * Log a security event with special formatting
 * 
 * @param {string} message The security message to log
 * @param {string} level The severity level: 'info', 'warn', 'error', 'critical'
 * @param {object} meta Additional metadata about the event
 */
export function logSecurityEvent(message, level = 'info', meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  // Console output in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    const color = {
      'info': '\x1b[34m', // blue
      'warn': '\x1b[33m', // yellow
      'error': '\x1b[31m', // red
      'critical': '\x1b[41m\x1b[37m' // white on red background
    }[level] || '\x1b[0m';
    
    console.log(`${color}[SECURITY:${level.toUpperCase()}]\x1b[0m ${message}`);
    if (Object.keys(meta).length > 0) {
      console.log('  Details:', meta);
    }
    
    // Also log to vite console for easier visibility
    log(`[SECURITY:${level.toUpperCase()}] ${message}`, 'security');
    
    return;
  }
  
  // In production, write to security log file
  try {
    const logString = JSON.stringify(logEntry) + '\\n';
    fs.appendFileSync(SECURITY_LOG_FILE, logString);
  } catch (error) {
    console.error('Failed to write to security log:', error);
  }
}

/**
 * Log an authentication attempt (success or failure)
 * 
 * @param {boolean} success Whether the authentication succeeded
 * @param {string} username The username that attempted to authenticate
 * @param {string} ip The IP address of the client
 * @param {string} userAgent The user agent string
 * @param {string} reason The reason for failure (if applicable)
 */
export function logAuthAttempt(success, username, ip, userAgent, reason = null) {
  const level = success ? 'info' : 'warn';
  const message = success 
    ? `Successful authentication for user ${username}` 
    : `Failed authentication attempt for user ${username}`;
    
  logSecurityEvent(message, level, {
    event: 'authentication',
    success,
    username,
    ip,
    userAgent,
    ...(reason ? { reason } : {})
  });
}

/**
 * Log suspicious activity that might indicate a security issue
 * 
 * @param {string} activity Description of the suspicious activity
 * @param {object} request Express request object
 */
export function logSuspiciousActivity(activity, request) {
  logSecurityEvent(`Suspicious activity: ${activity}`, 'warn', {
    event: 'suspicious_activity',
    ip: request.ip,
    method: request.method,
    path: request.path,
    userAgent: request.get('user-agent') || 'unknown',
    referrer: request.get('referer') || 'unknown'
  });
}

/**
 * Log a security violation (confirmed security issue)
 * 
 * @param {string} violation Description of the security violation
 * @param {object} request Express request object
 */
export function logSecurityViolation(violation, request) {
  logSecurityEvent(`Security violation: ${violation}`, 'error', {
    event: 'security_violation',
    ip: request.ip,
    method: request.method,
    path: request.path,
    userAgent: request.get('user-agent') || 'unknown',
    referrer: request.get('referer') || 'unknown',
    headers: Object.keys(request.headers).reduce((acc, key) => {
      // Avoid logging sensitive headers like cookies or auth tokens
      if (!['cookie', 'authorization', 'proxy-authorization'].includes(key.toLowerCase())) {
        acc[key] = request.headers[key];
      }
      return acc;
    }, {})
  });
}