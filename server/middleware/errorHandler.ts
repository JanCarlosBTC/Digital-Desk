import { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';

/**
 * Global error handling middleware
 * Catches errors from route handlers and formats consistent error responses
 * 
 * This middleware ensures that all unhandled errors in the application are:
 * 1. Properly logged with contextual information
 * 2. Formatted into a consistent response format
 * 3. Include appropriate HTTP status codes
 */
export function errorHandlerMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  // Extract error details or use defaults
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // Create error context for structured logging
  const errorContext = {
    err,
    reqId: req.headers['x-request-id'] || 'unknown',
    userId: (req as any).userId,
    path: req.path,
    method: req.method,
    statusCode: status,
    errorCode
  };
  
  // Log error with context (error level appropriate for 5xx, warn for 4xx)
  if (status >= 500) {
    logger.error(errorContext, `Error [${errorCode}]: ${message}`);
  } else {
    logger.warn(errorContext, `Warning [${errorCode}]: ${message}`);
  }
  
  // Send standardized error response
  res.status(status).json({ 
    error: {
      message,
      code: errorCode,
      status
    },
    timestamp: new Date().toISOString(),
    success: false
  });
}