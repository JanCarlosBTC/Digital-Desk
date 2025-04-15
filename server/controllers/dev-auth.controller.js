/**
 * Development Authentication Controller
 * 
 * WARNING: This controller contains endpoints that should ONLY be used in development
 * environments. These endpoints bypass normal authentication and are intended for
 * testing and development purposes only.
 */

import { storage } from '../storage.js';
import { generateToken } from '../middleware/auth.js';
import { logSecurityEvent, logAuthAttempt, logSuspiciousActivity } from '../middleware/security-logger.js';

/**
 * Development login endpoint - allows login without password verification
 * This should ONLY be available in development environments
 */
export const devLogin = async (req, res) => {
  // SECURITY CHECK: Only allow this endpoint in development environment
  if (process.env.NODE_ENV !== 'development') {
    // Log a critical security event for potential production breach attempt
    logSecurityEvent(
      'Attempt to access dev-login endpoint in non-development environment',
      'critical',
      { 
        ip: req.ip, 
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent') || 'unknown'
      }
    );
    return res.status(404).json({ message: 'Endpoint not available' });
  }
  
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Log development auth attempt for security auditing
    logSecurityEvent(
      `Development auth endpoint accessed for username: ${username}`,
      'warn',
      { 
        ip: req.ip, 
        username,
        method: req.method,
        userAgent: req.get('user-agent') || 'unknown' 
      }
    );
    
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      logAuthAttempt(
        false,
        username,
        req.ip,
        req.get('user-agent') || 'unknown',
        'User not found in dev auth'
      );
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Log the dev login for security tracking
    console.warn(`SECURITY WARNING: Dev login used for user: ${username}`);
    
    // Log successful auth attempt
    logAuthAttempt(
      true,
      username,
      req.ip,
      req.get('user-agent') || 'unknown',
      'Dev auth endpoint'
    );
    
    // Return user info and token - with shorter expiration for dev mode
    const token = generateToken(user.id, '4h'); // 4-hour expiration for dev tokens
    
    res.json({ 
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Dev login error:', error);
    
    // Log failed auth attempt
    logAuthAttempt(
      false,
      req.body.username || 'unknown',
      req.ip,
      req.get('user-agent') || 'unknown',
      `Error: ${error.message}`
    );
    
    res.status(500).json({ message: 'Error during dev login' });
  }
};