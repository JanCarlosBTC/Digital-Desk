/**
 * Development Authentication Controller
 * 
 * WARNING: This controller contains endpoints that should ONLY be used in development
 * environments. These endpoints bypass normal authentication and are intended for
 * testing and development purposes only.
 */

import { storage } from '../storage.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Development login endpoint - allows login without password verification
 * This should ONLY be available in development environments
 */
export const devLogin = async (req, res) => {
  // SECURITY CHECK: Only allow this endpoint in development environment
  if (process.env.NODE_ENV !== 'development') {
    console.error('Attempt to access dev-login endpoint in non-development environment');
    return res.status(404).json({ message: 'Endpoint not available' });
  }
  
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Log the dev login for security tracking
    console.warn(`SECURITY WARNING: Dev login used for user: ${username}`);
    
    // Return user info and token
    res.json({ 
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ message: 'Error during dev login' });
  }
};