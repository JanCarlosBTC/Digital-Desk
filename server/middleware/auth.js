/**
 * Authentication Middleware (JavaScript Implementation)
 * 
 * This is the active authentication module used by controllers and routes.
 * It provides JWT token generation, verification, and authentication middleware.
 * 
 * NOTE: This file is used by the current implementation. There is also an auth.ts
 * file which contains TypeScript types and interfaces but is not actively used.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';

// Use environment variable for JWT secret, with fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'digital_desk_jwt_secret_key_2025';

// Log JWT secret status on startup
console.log(`JWT_SECRET initialization: ${JWT_SECRET ? 'Secret is set' : 'SECRET IS MISSING!'}`);

// Temporary demo user ID until we implement proper authentication
const DEMO_USER_ID = 1;

/**
 * Middleware to authenticate a user from a JWT token
 * This middleware verifies the JWT token and attaches the userId to the request object
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Log auth header for debugging
    console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authentication failed: No token provided or invalid format');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log(`Verifying token: ${token.substring(0, 10)}...`);
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.error('Authentication failed: Invalid or expired token');
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    console.log(`Authentication successful for user ID: ${decoded.userId}`);
    
    // Attach user ID to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * Generate a JWT token for a user
 * Used during login and registration
 * 
 * @param {number} userId - The ID of the user to generate a token for
 * @returns {string} The generated JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify a JWT token
 * 
 * @param {string} token - The JWT token to verify
 * @returns {object|null} The decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    console.log(`Using JWT_SECRET: ${JWT_SECRET ? 'Secret is set' : 'Secret is missing!'}`);
    const result = jwt.verify(token, JWT_SECRET);
    console.log(`Token verification successful: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`Token verification failed: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      console.log('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token signature');
    } else {
      console.log(`Unknown token error: ${error.name}`);
    }
    return null;
  }
}; 