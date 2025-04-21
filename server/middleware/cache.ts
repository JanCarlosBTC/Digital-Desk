import { Request, Response, NextFunction } from 'express';
import { 
  getCache, 
  setCache, 
  invalidateCachePattern, 
  createCacheKey,
  cacheMiddleware as baseMiddleware
} from '../utils/cacheUtils.js';
import { log } from '../vite.js';

/**
 * Default cache TTL in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Cache middleware for Express routes with enhanced optimizations
 * - User-aware caching
 * - Optimized key generation
 * - Performance timing
 * 
 * @param resourceType The type of resource (e.g., 'users', 'decisions')
 * @param ttl Cache time-to-live in seconds
 * @returns Express middleware function
 */
export function cacheMiddleware(resourceType: string, ttl = DEFAULT_TTL) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const startTime = process.hrtime();
    
    // Get user ID if authenticated (for user-specific caching)
    const userId = (req as any).user?.id || null;
    const userSpecific = !!userId;
    
    // Create a more efficient cache key that includes user context when needed
    const cacheKey = createCacheKey(
      userSpecific ? `${resourceType}:user:${userId}` : resourceType, 
      {
        path: req.path,
        query: req.query
      }
    );
    
    try {
      // Try to get response from cache
      const cachedResponse = await getCache<any>(cacheKey);
      
      if (cachedResponse) {
        // Calculate and log response time
        const elapsedTime = process.hrtime(startTime);
        const ms = elapsedTime[0] * 1000 + elapsedTime[1] / 1000000;
        
        if (ms > 10) {
          // Only log slow cache hits
          log(`Cache hit: ${cacheKey} (${ms.toFixed(2)}ms)`, 'cache');
        }
        
        return res.json(cachedResponse);
      }
      
      // If not in cache, capture the response to cache it
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to intercept response
      res.json = function(body: any) {
        // Only cache if the response is successful (2xx status)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Don't await - fire and forget the cache operation
          setCache(cacheKey, body, ttl).catch(err => {
            // Only log serious errors, and only once per error type
            log(`Cache set error: ${err.message}`, 'cache');
          });
        }
        
        // Restore original behavior
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      // If there's an error with caching, continue without it
      next();
    }
  };
}

/**
 * Clear cache when resource is modified
 * Use this middleware for POST, PUT, PATCH, DELETE requests
 * 
 * @param resourceType The type of resource (e.g., 'users', 'decisions')
 * @returns Express middleware function
 */
export function clearCacheMiddleware(resourceType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original end method (more reliable than send)
    const originalEnd = res.end;
    
    // Override end method
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      // Only clear cache if the operation was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Get user ID if authenticated (for user-specific cache clearing)
        const userId = (req as any).user?.id;
        
        // Clear cache patterns
        const patterns = [
          `${resourceType}:*`,
          // Also clear user-specific cache for this resource
          userId ? `${resourceType}:user:${userId}:*` : undefined
        ].filter(Boolean) as string[];
        
        // Don't await - fire and forget pattern invalidation
        patterns.forEach(pattern => {
          invalidateCachePattern(pattern).catch(() => {
            // Fail silently - caching is a performance optimization, not a critical feature
          });
        });
      }
      
      // Call original end method with passed parameters
      return originalEnd.call(this, chunk, encoding, cb);
    };
    
    next();
  };
}