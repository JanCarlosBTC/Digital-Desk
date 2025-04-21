import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// This export is needed to make this file a module
export {};