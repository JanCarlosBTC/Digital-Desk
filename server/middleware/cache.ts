import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, invalidateCachePattern, createCacheKey } from '../utils/cacheUtils.js';
import { log } from '../vite.js';

// Track if Redis is available
let isRedisAvailable = false;

// Update Redis availability status
try {
  isRedisAvailable = process.env.REDIS_URL !== undefined;
} catch (e) {
  isRedisAvailable = false;
}

/**
 * Default cache TTL in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Cache middleware for Express routes
 * Caches responses from GET requests and serves them on subsequent requests
 * 
 * @param resourceType The type of resource (e.g., 'users', 'decisions')
 * @param ttl Cache time-to-live in seconds
 * @returns Express middleware function
 */
export function cacheMiddleware(resourceType: string, ttl = DEFAULT_TTL) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if Redis is not available or for non-GET requests
    if (!isRedisAvailable || req.method !== 'GET') {
      return next();
    }
    
    // Skip caching for authenticated requests that should be user-specific
    // Depending on your authentication strategy, you may need to adjust this
    const userId = (req as any).user?.id || null;
    
    // Create a unique cache key based on URL path, query parameters, and user ID
    const cacheKey = createCacheKey(resourceType, {
      path: req.path,
      query: req.query,
      userId
    });
    
    try {
      // Try to get response from cache
      const cachedResponse = await getCache<any>(cacheKey);
      
      if (cachedResponse) {
        log(`Cache hit: ${cacheKey}`, 'cache');
        return res.json(cachedResponse);
      }
      
      // If not in cache, capture the response to cache it
      log(`Cache miss: ${cacheKey}`, 'cache');
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to intercept response
      res.json = function(body: any) {
        // Only attempt to cache if Redis is available
        if (isRedisAvailable) {
          setCache(cacheKey, body, ttl)
            .catch(err => log(`Error setting cache: ${err}`, 'cache'));
        }
        
        // Restore original behavior
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      // If there's an error with caching, continue without it
      log(`Cache middleware error: ${error}`, 'cache');
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
    // Skip if Redis is not available
    if (!isRedisAvailable) {
      return next();
    }
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method
    res.send = function(body) {
      // Only clear cache if the operation was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Clear cache pattern for this resource type
        invalidateCachePattern(`${resourceType}:*`)
          .catch(err => log(`Error clearing cache: ${err}`, 'cache'));
      }
      
      // Call original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
}