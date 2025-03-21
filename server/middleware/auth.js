/**
 * Authentication Middleware - Simplified Version
 * 
 * This is a simplified auth middleware that automatically attaches a demo user ID
 * to every request without requiring actual authentication.
 */

/**
 * Always authenticate as demo user
 * This middleware provides automatic authentication for all routes
 */
export const authenticate = (req, res, next) => {
  // Set demo user ID
  req.userId = 1;

  // For compatibility with code that may check for this user object
  req.user = {
    id: 1,
    username: 'demo',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  // Continue to the actual endpoint handler
  return next();
};

/**
 * Generate a dummy token (not used in this simplified version)
 */
export const generateToken = (userId) => {
  return 'dummy-token-for-development';
};

/**
 * Verify token (not used in this simplified version)
 */
export const verifyToken = (token) => {
  return { userId: 1 };
}; 