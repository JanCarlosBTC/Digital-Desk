import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to bypass host restrictions in Replit environment
 * This helps resolve CORS and host restriction issues
 */
export function hostBypassMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get host and origin information
  const host = req.headers.host || '';
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  
  // Log detailed information for debugging
  console.log(`[HOST-BYPASS] Request from host: ${host}`);
  console.log(`[HOST-BYPASS] Origin: ${origin}`);
  console.log(`[HOST-BYPASS] Referer: ${referer}`);
  console.log(`[HOST-BYPASS] Path: ${req.path}`);
  
  // Set CORS headers to allow all origins
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Add headers to help with Replit host restrictions
  res.header('X-Forwarded-Host', host);
  res.header('X-Real-IP', req.ip || '');
  res.header('X-Forwarded-For', req.ip || '');
  
  // Add headers that might be checked by Replit
  if (process.env.REPL_ID) {
    res.header('X-Replit-User-Id', process.env.REPL_ID);
    res.header('X-Replit-User-Name', process.env.REPL_SLUG || 'replit-user');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Track request start time for logging
  const startTime = Date.now();
  
  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[HOST-BYPASS] Response completed in ${duration}ms with status ${res.statusCode}`);
  });
  
  next();
}
