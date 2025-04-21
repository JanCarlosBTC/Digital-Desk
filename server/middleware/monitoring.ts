import { Request, Response, NextFunction } from 'express';
import { log } from '../vite.js';
import fs from 'fs';
import path from 'path';

// Initialize security log file
const LOG_DIR = process.env.LOG_DIR || './logs';
const SECURITY_LOG_PATH = path.join(LOG_DIR, 'security.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Suspicious patterns to monitor
const SUSPICIOUS_PATTERNS = [
  // SQL Injection patterns
  /(%27)|(')|(--)|(#)/i,
  /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/i,
  /\w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  
  // XSS patterns
  /((%3C)|<)((%2F)|\/)*[a-z0-9%]+((%3E)|>)/i,
  /((%3C)|<)((%69)|i|(%49))((%6D)|m|(%4D))((%67)|g|(%47))[^\n]+((%3E)|>)/i,
  
  // Path traversal
  /\.\.\//i,
  
  // Command injection
  /;|\||`|&/i
];

/**
 * Log security events to a file
 */
function logSecurityEvent(req: Request, message: string, severity: 'warning' | 'critical' = 'warning') {
  const timestamp = new Date().toISOString();
  const ip = req.ip || 'unknown';
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  const logEntry = `[${timestamp}] [${severity.toUpperCase()}] [${ip}] ${method} ${url} - ${message} - ${userAgent}\n`;
  
  // Log to console for immediate visibility
  if (severity === 'critical') {
    console.error(logEntry);
  } else {
    console.warn(logEntry);
  }
  
  // Write to log file
  fs.appendFile(SECURITY_LOG_PATH, logEntry, (err) => {
    if (err) {
      console.error(`Failed to write to security log: ${err.message}`);
    }
  });
  
  // Also log using the application's logger
  log(`Security ${severity}: ${message} - IP: ${ip}`, 'security');
}

/**
 * Middleware to monitor and log suspicious activities
 */
export function securityMonitoring(req: Request, res: Response, next: NextFunction) {
  // Check for suspicious patterns in request parameters
  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body);
  const params = JSON.stringify(req.params);
  const query = JSON.stringify(req.query);
  
  // Combine all request data for checking
  const requestData = `${url} ${body} ${params} ${query}`;
  
  // Check each suspicious pattern
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(requestData)) {
      const message = `Potentially malicious pattern detected: ${pattern}`;
      logSecurityEvent(req, message, 'warning');
      break; // Only log once per request
    }
  }
  
  // Monitor for unusual HTTP methods
  const unusualMethods = ['TRACE', 'TRACK', 'CONNECT', 'OPTIONS'];
  if (unusualMethods.includes(req.method)) {
    logSecurityEvent(req, `Unusual HTTP method: ${req.method}`);
  }
  
  // Monitor response for errors that might indicate security issues
  res.on('finish', () => {
    // Log 401/403 errors as they might indicate break-in attempts
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent(req, `Authentication/Authorization failure: ${res.statusCode}`);
    }
    
    // Log server errors as they might indicate successful attacks
    if (res.statusCode >= 500) {
      logSecurityEvent(req, `Server error that might indicate security issue: ${res.statusCode}`, 'critical');
    }
  });
  
  next();
} 