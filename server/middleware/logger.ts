/**
 * HTTP Request Logging Middleware
 * 
 * This middleware logs incoming HTTP requests using the Pino logger.
 * It captures method, path, status code, response time, and user info when available.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';

interface LoggingRequest extends Request {
  startTime?: [number, number];
  userId?: number;
}

/**
 * Express middleware to log HTTP requests
 */
export function requestLogger(req: LoggingRequest, res: Response, next: NextFunction) {
  // Record the start time using high-resolution timer
  req.startTime = process.hrtime();
  
  // Log the request when it completes
  res.on('finish', () => {
    // Calculate duration
    const duration = process.hrtime(req.startTime);
    const durationMs = (duration[0] * 1000) + (duration[1] / 1000000);
    
    // Create log context with request details
    const logContext = {
      method: req.method,
      path: req.path,
      params: req.params,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      statusCode: res.statusCode,
      responseTime: Math.round(durationMs),
      userAgent: req.get('user-agent'),
      userId: req.userId,
      ip: req.ip || req.ips?.join(', ') || 'unknown'
    };

    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(logContext, `${req.method} ${req.path} ${res.statusCode}`);
    } else if (res.statusCode >= 400) {
      logger.warn(logContext, `${req.method} ${req.path} ${res.statusCode}`);
    } else {
      logger.info(logContext, `${req.method} ${req.path} ${res.statusCode}`);
    }
  });

  next();
}