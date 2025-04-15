/**
 * Development-only Authentication Controller
 * 
 * This controller provides simplified authentication methods for development purposes.
 * These endpoints should NEVER be exposed in production and are disabled outside
 * of development environments.
 */

const jwt = require('jsonwebtoken');
const { logAuthAttempt } = require('../middleware/security-logger.js');

// Simplified dev login that doesn't check credentials
// Only available in development mode
function devLogin(req, res) {
  // Basic validation
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // Create a JWT token for development
    // In development, we use a hardcoded secret that's fine for testing
    // In production, environment variables would be used for the secret
    const devSecret = 'development-only-secret';
    
    // User for development - simplified with ID=1
    const devUser = {
      id: 1,
      username: username,
      role: 'user'
    };
    
    // Create token with 1 day expiry
    const token = jwt.sign(
      { id: devUser.id, username: devUser.username },
      devSecret,
      { expiresIn: '1d' }
    );
    
    // Log successful login
    logAuthAttempt(username, true, req);
    
    // Return successful login
    return res.status(200).json({
      message: 'Development login successful',
      token,
      user: {
        id: devUser.id,
        username: devUser.username
      }
    });
  } catch (error) {
    console.error('Dev login error:', error);
    
    // Log failed login
    logAuthAttempt(username, false, req);
    
    return res.status(500).json({ message: 'Development login error' });
  }
}

module.exports = {
  devLogin
};