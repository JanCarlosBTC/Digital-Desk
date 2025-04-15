/**
 * Authentication Controller
 * 
 * This controller handles user authentication, including login, logout,
 * and retrieving the current user's profile.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logAuthAttempt } = require('../middleware/security-logger.js');

// Get JWT secret from environment variable or use a secure default for development
const JWT_SECRET = process.env.JWT_SECRET || 'use-env-var-in-production';

/**
 * Login endpoint
 * Validates credentials and issues a JWT token
 */
async function login(req, res) {
  const { username, password } = req.body;
  
  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  
  try {
    // In a real app, we would fetch the user from the database
    // For this demo, we'll use a simplified approach
    
    if (process.env.NODE_ENV === 'production') {
      // In production, we would check against the database
      const user = await getUserFromDatabase(username);
      
      if (!user) {
        logAuthAttempt(username, false, req);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password with bcrypt
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!validPassword) {
        logAuthAttempt(username, false, req);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      logAuthAttempt(username, true, req);
      return res.status(200).json({ token, user: { id: user.id, username: user.username } });
    } else {
      // In development, accept any credentials
      // This is just for demo and development
      const userId = 1;
      
      // Generate JWT token
      const token = jwt.sign(
        { id: userId, username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      logAuthAttempt(username, true, req);
      return res.status(200).json({ 
        token, 
        user: { id: userId, username } 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    logAuthAttempt(username, false, req);
    return res.status(500).json({ message: 'Authentication failed' });
  }
}

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }
  
  const token = parts[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Get user profile
 * Returns the authenticated user's profile
 */
async function getProfile(req, res) {
  try {
    // In a real app, fetch user data from database
    // For demo, we use simplified data
    return res.status(200).json({
      id: req.userId,
      username: 'user',
      // Other non-sensitive user data would go here
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
}

/**
 * In a real app, this would fetch the user from a database
 * For this demo, we're using a mock implementation
 */
async function getUserFromDatabase(username) {
  // Mock user for demo purposes
  // In a real app, this would query the database
  return {
    id: 1,
    username: 'admin',
    passwordHash: await bcrypt.hash('admin', 10)
  };
}

module.exports = {
  login,
  authenticate,
  getProfile
};