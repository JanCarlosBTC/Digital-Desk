/**
 * Authentication Middleware (TypeScript Implementation)
 * 
 * This provides JWT token generation, verification, and authentication middleware.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

// Define token payload interface
interface JwtPayload {
  userId: number;
  [key: string]: any;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// Use environment variable for JWT secret
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. Authentication system is insecure!');
  // Only allow fallback in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using insecure temporary JWT secret for DEVELOPMENT ONLY');
    JWT_SECRET = 'temp_dev_' + Math.random().toString(36).substring(2);
  } else {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
}

// Temporary demo user ID until we implement proper authentication
const DEMO_USER_ID = 1;

/**
 * Middleware to authenticate a user from a JWT token
 * This middleware verifies the JWT token and attaches the userId to the request object
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }
    
    const token = authHeader.split(' ')[1] || '';
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      throw new Error('Invalid token');
    }
    
    // Attach user ID to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * Generate a JWT token for a user
 * Used during login and registration
 * 
 * @param userId - The ID of the user to generate a token for
 * @returns The generated JWT token
 */
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify a JWT token
 * 
 * @param token - The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};