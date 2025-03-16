import { Redis } from 'ioredis';
import { log } from '../vite.js';

/**
 * Default cache TTL in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Optimized Redis cache manager with proper connection handling
 * and reconnection logic.
 */
class CacheManager {
  private client: Redis | null = null;
  private available: boolean = false;
  private connectionAttempted: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private errorCount: number = 0;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Only initialize Redis if REDIS_URL is explicitly set
    if (!process.env.REDIS_URL) {
      log('No REDIS_URL found, caching disabled', 'cache');
      return;
    }

    try {
      this.connectionAttempted = true;
      this.client = new Redis(process.env.REDIS_URL, {
        // Optimized connection settings
        connectTimeout: 5000, 
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false,
        enableReadyCheck: true,
        // More efficient retry strategy
        retryStrategy: (times) => {
          if (times > 3) {
            // After 3 attempts, try again in 30 seconds
            this.scheduleReconnect();
            return null; // Stop immediate retrying
          }
          return Math.min(times * 200, 2000); // Backoff strategy
        }
      });

      // Set up event handlers
      this.setupEventHandlers();
    } catch (error) {
      log(`Error initializing Redis: ${error}`, 'cache');
      this.available = false;
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.available = true;
      this.errorCount = 0;
      log('Redis client connected', 'cache');
    });

    this.client.on('ready', () => {
      this.available = true;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.client.on('error', (err: Error) => {
      this.errorCount++;
      // Log errors sparingly to avoid flooding logs
      if (this.errorCount <= 3 || this.errorCount % 10 === 0) {
        log(`Redis connection error (${this.errorCount}): ${err}`, 'cache');
      }
      this.available = false;
    });

    this.client.on('end', () => {
      this.available = false;
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      log('Attempting to reconnect to Redis...', 'cache');
      this.reconnectTimer = null;
      if (this.client) {
        this.client.quit().catch(() => {});
        this.client = null;
      }
      this.initialize();
    }, 30000); // Try again in 30 seconds
  }

  /**
   * Check if Redis is available
   */
  public isAvailable(): boolean {
    return this.available && this.client !== null;
  }

  /**
   * Sets a key-value pair in the cache
   */
  public async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
    if (!this.isAvailable() || !this.client) {
      return false;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(key, serializedValue, 'EX', ttl);
      return true;
    } catch (error) {
      log(`Error setting cache: ${error}`, 'cache');
      return false;
    }
  }

  /**
   * Gets a value from the cache
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable() || !this.client) {
      return null;
    }
    
    try {
      const value = await this.client.get(key);
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
   */
  public async invalidate(key: string): Promise<boolean> {
    if (!this.isAvailable() || !this.client) {
      return false;
    }
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      log(`Error invalidating cache: ${error}`, 'cache');
      return false;
    }
  }

  /**
   * Invalidates multiple cache keys based on a pattern
   */
  public async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.isAvailable() || !this.client) {
      return false;
    }
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      log(`Error invalidating cache pattern: ${error}`, 'cache');
      return false;
    }
  }

  /**
   * Checks if a key exists in the cache
   */
  public async has(key: string): Promise<boolean> {
    if (!this.isAvailable() || !this.client) {
      return false;
    }
    
    try {
      return await this.client.exists(key) === 1;
    } catch (error) {
      log(`Error checking cache existence: ${error}`, 'cache');
      return false;
    }
  }

  /**
   * Gracefully closes the Redis connection
   */
  public async quit(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.client) {
      try {
        await this.client.quit();
      } catch (e) {
        // Ignore errors on quit
      }
      this.client = null;
      this.available = false;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

/**
 * Creates a cache key for a specific resource
 */
export function createCacheKey(resourceType: string, identifier: string | number | Record<string, any>): string {
  if (typeof identifier === 'object') {
    return `${resourceType}:${JSON.stringify(identifier)}`;
  }
  
  return `${resourceType}:${identifier}`;
}

/**
 * Sets a key-value pair in the cache with an optional TTL
 */
export async function setCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
  return await cacheManager.set(key, value, ttl);
}

/**
 * Gets a value from the cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  return await cacheManager.get<T>(key);
}

/**
 * Invalidates a specific cache key
 */
export async function invalidateCache(key: string): Promise<boolean> {
  return await cacheManager.invalidate(key);
}

/**
 * Invalidates multiple cache keys based on a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<boolean> {
  return await cacheManager.invalidatePattern(pattern);
}

/**
 * Checks if a key exists in the cache
 */
export async function hasCache(key: string): Promise<boolean> {
  return await cacheManager.has(key);
}

/**
 * Middleware that caches responses for GET requests
 */
export function cacheMiddleware(resourceType: string, ttl: number = DEFAULT_TTL) {
  return async (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET' || !cacheManager.isAvailable()) {
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
        if (cacheManager.isAvailable()) {
          setCache(cacheKey, data, ttl).catch((err) => {
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
  await cacheManager.quit();
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