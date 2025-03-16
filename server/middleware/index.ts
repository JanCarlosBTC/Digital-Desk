import { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { loggerMiddleware } from './logger.js';
import { errorHandlerMiddleware } from './errorHandler.js';
import { hostBypassMiddleware } from './host-bypass.js';
import { log } from '../vite.js';

// Type definitions to help TypeScript understand dynamic imports
declare module 'connect-redis' {
  import { Store } from 'express-session';
  export interface RedisStoreFactory {
    (session: typeof import('express-session')): new (options: any) => Store;
  }
  const redisStoreFactory: RedisStoreFactory;
  export default redisStoreFactory;
}

declare module 'memorystore' {
  import { Store } from 'express-session';
  export interface MemoryStoreFactory {
    (session: typeof import('express-session')): new (options: any) => Store;
  }
  const memoryStoreFactory: MemoryStoreFactory;
  export default memoryStoreFactory;
}

declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  export interface PgStoreFactory {
    (session: typeof import('express-session')): new (options: any) => Store;
  }
  const pgStoreFactory: PgStoreFactory;
  export default pgStoreFactory;
}

/**
 * Registers all middleware components with the Express application
 * This ensures consistent middleware ordering and configuration
 * 
 * @param app Express application instance
 */
export function setupMiddleware(app: Express): void {
  // Basic middleware setup
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Custom middleware components
  app.use(hostBypassMiddleware);
  app.use(loggerMiddleware);
  
  // Session configuration - applied after core middleware
  setupSession(app);
  
  // Error handler - must be last
  app.use(errorHandlerMiddleware);
  
  log('All middleware configured successfully', 'middleware');
}

/**
 * Configures session middleware with security best practices
 * 
 * @param app Express application instance
 */
function setupSession(app: Express): void {
  // Session configuration
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'digital-desk-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };
  
  // In production, use Redis or PostgreSQL for session storage
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REDIS_URL) {
      // Use Redis for session storage in production if available
      try {
        // Using dynamic import to avoid type issues
        const setupRedisSession = async () => {
          try {
            // These imports are done dynamically to avoid type errors
            // Connect-redis v8.0.2 has no default export, so we handle it specially
            const RedisStore = await import('connect-redis').then(module => {
              // Handle both ESM and CommonJS versions of connect-redis
              const RedisStoreFactory = module.default || module;
              return RedisStoreFactory(session);
            });
            const { Redis } = await import('ioredis');
            
            const redisClient = new Redis(process.env.REDIS_URL!);
            
            // @ts-ignore - Type safety is handled manually here
            sessionOptions.store = new RedisStore({
              client: redisClient,
              prefix: 'digital-desk-session:',
            });
            
            app.use(session(sessionOptions));
            log('Redis session store configured', 'middleware');
          } catch (err) {
            log(`Redis session setup failed: ${err}`, 'middleware');
            app.use(session(sessionOptions)); // Fallback to memory store
          }
        };
        
        setupRedisSession();
      } catch (err) {
        log(`Could not initialize Redis session: ${err}`, 'middleware');
        app.use(session(sessionOptions)); // Fallback to memory store
      }
    } else if (process.env.DATABASE_URL) {
      // Use PostgreSQL for session storage in production if available
      try {
        const setupPgSession = async () => {
          try {
            const pgModule = await import('connect-pg-simple');
            const PgSession = pgModule.default(session);
            
            // @ts-ignore - Type safety is handled manually here
            sessionOptions.store = new PgSession({
              conString: process.env.DATABASE_URL,
              tableName: 'session', // Make sure this table exists
              schemaName: 'public',
            });
            
            app.use(session(sessionOptions));
            log('PostgreSQL session store configured', 'middleware');
          } catch (err) {
            log(`PostgreSQL session setup failed: ${err}`, 'middleware');
            app.use(session(sessionOptions)); // Fallback to memory store
          }
        };
        
        setupPgSession();
      } catch (err) {
        log(`Could not initialize PostgreSQL session: ${err}`, 'middleware');
        app.use(session(sessionOptions)); // Fallback to memory store
      }
    } else {
      // Fallback to memory store with a warning
      try {
        const setupMemorySession = async () => {
          try {
            const memoryModule = await import('memorystore');
            const MemoryStore = memoryModule.default(session);
            
            // @ts-ignore - Type safety is handled manually here
            sessionOptions.store = new MemoryStore({
              checkPeriod: 86400000 // Prune expired entries every 24h
            });
            
            app.use(session(sessionOptions));
            log('Warning: Using memory session store in production', 'middleware');
          } catch {
            app.use(session(sessionOptions)); // Fallback to default memory store
          }
        };
        
        setupMemorySession();
      } catch {
        app.use(session(sessionOptions)); // Fallback to default memory store
      }
    }
  } else {
    // Development environment - use memory store
    app.use(session(sessionOptions));
    log('Memory session store configured for development', 'middleware');
  }
}