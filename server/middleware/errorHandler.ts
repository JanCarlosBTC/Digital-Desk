import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Catches errors from route handlers and formats consistent error responses
 */
export function errorHandlerMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Extract error details or use defaults
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log error details for debugging
  console.error(`[ERROR] ${status}: ${message}`, err.stack);
  
  // Send standardized error response
  res.status(status).json({ 
    message,
    status,
    timestamp: new Date().toISOString(),
    success: false
  });
}