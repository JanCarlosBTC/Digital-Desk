/**
 * CSRF Protection Middleware
 * 
 * This middleware provides Cross-Site Request Forgery (CSRF) protection by
 * implementing the Double Submit Cookie pattern. It issues a CSRF token as a
 * cookie and requires that token to be submitted with non-GET requests.
 * 
 * For maximum security, use this with SameSite=Strict cookies and HTTPS.
 */

const crypto = require('crypto');
const { logSecurityEvent } = require('./security-logger.js');

// Generate a secure random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if a request requires CSRF validation
const requiresValidation = (req) => {
  const method = req.method.toUpperCase();
  // Validate POST, PUT, PATCH and DELETE requests
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
};

/**
 * CSRF Protection Middleware
 * 
 * @param {Object} options Configuration options
 * @param {string} options.cookieName Name of the cookie to use (default: 'csrf-token')
 * @param {string} options.headerName Name of the header to check (default: 'X-CSRF-TOKEN')
 * @param {Array<string>} options.ignorePaths Paths to ignore CSRF check (default: [])
 * @returns {Function} Express middleware function
 */
function csrfProtection(options = {}) {
  const {
    cookieName = 'csrf-token',
    headerName = 'X-CSRF-TOKEN',
    ignorePaths = []
  } = options;
  
  return (req, res, next) => {
    // Configure CSRF cookie settings
    const secureCookie = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: secureCookie,
      path: '/'
    };
    
    // Check for existing token in cookie or generate a new one
    let token = req.cookies && req.cookies[cookieName];
    
    if (!token) {
      token = generateToken();
      res.cookie(cookieName, token, cookieOptions);
    }
    
    // Expose a method to get the token from the request
    req.csrfToken = () => token;
    
    // Skip CSRF check for ignored paths or non-mutating requests
    const shouldSkip = !requiresValidation(req) || 
                      ignorePaths.some(path => req.path.startsWith(path));
                      
    if (shouldSkip) {
      return next();
    }
    
    // Get token from request header
    const requestToken = req.headers[headerName.toLowerCase()];
    
    // Validate token
    if (!requestToken || requestToken !== token) {
      // Log potential CSRF attack
      logSecurityEvent('CSRF validation failed', 'error', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent') || 'unknown',
        cookieToken: !!token,
        headerToken: !!requestToken
      });
      
      return res.status(403).json({
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token'
      });
    }
    
    next();
  };
}

module.exports = csrfProtection;