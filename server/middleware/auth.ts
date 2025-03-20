/**
 * Authentication TypeScript Interface Declarations
 * 
 * This file provides TypeScript interfaces and type declarations for authentication.
 * 
 * NOTE: This is NOT the active implementation used by the application.
 * The actual implementation is in auth.js which is imported by the controllers.
 * This file serves as a type declaration reference for TypeScript.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Use environment variable for JWT secret, with fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'temp_development_secret';

// Extended request type with userId
export interface AuthenticatedRequest extends Request {
  userId: number;
}

/**
 * Middleware to authenticate a user from a JWT token
 * TypeScript interface declaration only - implementation in auth.js
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }
    
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2) {
      throw new Error('Invalid authorization format');
    }
    
    // At this point, we know tokenParts[1] exists
    const token = tokenParts[1];
    if (!token) {
      throw new Error('Invalid token format');
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      throw new Error('Invalid token');
    }
    
    // Attach user ID to request
    (req as AuthenticatedRequest).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * Generate a JWT token for a user
 * TypeScript interface declaration only - implementation in auth.js
 */
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify a JWT token
 * TypeScript interface declaration only - implementation in auth.js
 */
export const verifyToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
}; 