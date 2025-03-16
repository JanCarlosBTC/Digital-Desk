import { Redis } from 'ioredis';
import { log } from '../vite.js';

// Initialize Redis client
let redisClient: Redis | null = null;
let isRedisAvailable = false;
let connectionAttempted = false;

// Only initialize Redis if REDIS_URL is explicitly set
if (process.env.REDIS_URL) {
  try {
    connectionAttempted = true;
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3, // Reduce retry attempts to avoid flooding logs
      retryStrategy: (times) => {
        if (times > 3) {
          // After 3 attempts, give up for this instance
          isRedisAvailable = false;
          return null; // Stop retrying
        }
        return Math.min(times * 100, 1000); // Backoff strategy
      }
    });
    
    redisClient.on('connect', () => {
      isRedisAvailable = true;
      log('Redis client connected', 'cache');
    });
    
    redisClient.on('error', (err: Error) => {
      // Log only the first few errors to avoid flooding logs
      if (isRedisAvailable || !connectionAttempted) {
        log(`Redis connection error: ${err}`, 'cache');
        isRedisAvailable = false;
      }
    });
  } catch (error) {
    log(`Error initializing Redis: ${error}`, 'cache');
    isRedisAvailable = false;
  }
} else {
  log('No REDIS_URL found, caching disabled', 'cache');
  isRedisAvailable = false;
}

/**
 * Default cache TTL in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Sets a key-value pair in the cache with an optional TTL
 * 
 * @param key Cache key
 * @param value Value to store (will be serialized to JSON)
 * @param ttl Optional TTL in seconds
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function setCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
  if (!redisClient) {
    return false;
  }
  
  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.set(key, serializedValue, 'EX', ttl);
    return true;
  } catch (error) {
    log(`Error setting cache: ${error}`, 'cache');
    return false;
  }
}

/**
 * Gets a value from the cache
 * 
 * @param key Cache key
 * @returns Promise that resolves to the cached value or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient) {
    return null;
  }
  
  try {
    const value = await redisClient.get(key);
    if (!value) {
      return null;
    }
    
    return JSON.parse(value) as T;
  } catch (error) {
    log(`Error getting from cache: ${error}`, 'cache');
    return null;
  }
}

/**
 * Invalidates a specific cache key
 * 
 * @param key Cache key to invalidate
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function invalidateCache(key: string): Promise<boolean> {
  if (!redisClient) {
    return false;
  }
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    log(`Error invalidating cache: ${error}`, 'cache');
    return false;
  }
}

/**
 * Invalidates multiple cache keys based on a pattern
 * 
 * @param pattern Pattern to match (e.g., "user:*")
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function invalidateCachePattern(pattern: string): Promise<boolean> {
  if (!redisClient) {
    return false;
  }
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    log(`Error invalidating cache pattern: ${error}`, 'cache');
    return false;
  }
}

/**
 * Checks if a key exists in the cache
 * 
 * @param key Cache key
 * @returns Promise that resolves to true if key exists, false otherwise
 */
export async function hasCache(key: string): Promise<boolean> {
  if (!redisClient) {
    return false;
  }
  
  try {
    return await redisClient.exists(key) === 1;
  } catch (error) {
    log(`Error checking cache existence: ${error}`, 'cache');
    return false;
  }
}

/**
 * Creates a cache key for a specific resource
 * 
 * @param resourceType Type of resource (e.g., "user", "decision")
 * @param identifier Resource identifier or query parameters
 * @returns Cache key
 */
export function createCacheKey(resourceType: string, identifier: string | number | Record<string, any>): string {
  if (typeof identifier === 'object') {
    return `${resourceType}:${JSON.stringify(identifier)}`;
  }
  
  return `${resourceType}:${identifier}`;
}

/**
 * Middleware that caches responses for GET requests
 * 
 * @param resourceType Type of resource to cache (e.g., "users", "decisions")
 * @param ttl Optional TTL in seconds
 * @returns Express middleware function
 */
export function cacheMiddleware(resourceType: string, ttl: number = DEFAULT_TTL) {
  return async (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET' || !isRedisAvailable) {
      return next();
    }
    
    // Create cache key based on URL path and query parameters
    const cacheKey = createCacheKey(resourceType, {
      path: req.path,
      query: req.query
    });
    
    try {
      // Check if response exists in cache
      const cachedResponse = await getCache(cacheKey);
      
      if (cachedResponse) {
        // Return cached response
        return res.json(cachedResponse);
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data: any) {
        // Only attempt to cache if Redis is available
        if (isRedisAvailable) {
          setCache(cacheKey, data, ttl).catch((err) => {
            // Only log the first few errors to reduce noise
            log(`Error caching response: ${err}`, 'cache');
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      // In case of error, continue without caching
      next();
    }
  };
}

/**
 * Gracefully closes the Redis connection
 */
export async function closeCacheConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export default {
  setCache,
  getCache,
  invalidateCache,
  invalidateCachePattern,
  hasCache,
  createCacheKey,
  cacheMiddleware,
  closeCacheConnection
};