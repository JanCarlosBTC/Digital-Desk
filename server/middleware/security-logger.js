/**
 * Security Logging Middleware
 * 
 * This module provides functions for logging security-related events
 * including suspicious activities, authentication attempts, and potential attacks.
 * 
 * This is a critical security component that provides visibility into potential threats
 * and helps with forensic analysis in case of security incidents.
 */

// Security log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4
};

// Format timestamp for logging
const getTimestamp = () => {
  return new Date().toISOString();
};

// Set minimum log level based on environment
const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.info;

// Write to the security log file and/or console
const logToSecurity = (message, level = 'info') => {
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
 * @param {string} message - The log message
 * @param {string} level - Log level: debug, info, warn, error, critical
 * @param {Object} metadata - Additional data to log 
 */
function logSecurityEvent(message, level = 'info', metadata = {}) {
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
 * @param {string} message - Description of the suspicious activity
 * @param {Object} req - Express request object
 */
function logSuspiciousActivity(message, req) {
  const metadata = {
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
 * @param {string} username - The username that attempted authentication 
 * @param {boolean} success - Whether authentication succeeded
 * @param {Object} req - Express request object
 */
function logAuthAttempt(username, success, req) {
  const outcome = success ? 'successful' : 'failed';
  
  const metadata = {
    ip: req.ip,
    username,
    userAgent: req.get('user-agent') || 'unknown'
  };
  
  const level = success ? 'info' : 'warn';
  
  logSecurityEvent(`Authentication ${outcome} for user: ${username}`, level, metadata);
}

module.exports = {
  logSecurityEvent,
  logSuspiciousActivity,
  logAuthAttempt
};