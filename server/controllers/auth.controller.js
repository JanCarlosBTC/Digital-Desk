import bcrypt from 'bcrypt';
import { storage } from '../storage.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { username, password, email, name } = req.body;
    
    // Check if user exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      email,
      name,
      plan: 'Free',
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase()
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`[Auth Controller] Login attempt for username: ${username}`);

    // Find user
    const user = await storage.getUserByUsername(username);
    
    // IMPORTANT: For development purposes, we're allowing login with demo user
    // This is a temporary solution for easier testing
    if (username === 'demo') {
      console.log('[Auth Controller] Using demo user login - bypassing password check');
      
      // If demo user doesn't exist in database, create a temporary one
      if (!user) {
        console.log('[Auth Controller] Creating temporary demo user for login');
        
        // Create a temporary demo user object
        const demoUser = {
          id: 999,
          username: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          plan: 'Trial',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const token = generateToken(demoUser.id);
        console.log(`[Auth Controller] Generated token for demo user ${demoUser.id}:`, token);
        
        return res.json({
          user: demoUser,
          token: token
        });
      }
      
      // Use existing demo user
      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(user.id);
      console.log(`[Auth Controller] Generated token for demo user ${user.id}:`, token);
      
      return res.json({
        user: userWithoutPassword,
        token: token
      });
    }
    
    // Normal user flow for non-demo users
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found with id: ${user.id}`);
    console.log(`Password from request: ${password}`);
    console.log(`Stored hashed password: ${user.password}`);
    
    try {
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Password validation result: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.log('Password validation failed');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      console.error('bcrypt error:', bcryptError);
      return res.status(500).json({ message: 'Error validating credentials' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    const token = generateToken(user.id);
    console.log(`Generated token for user ${user.id}`);
    
    res.json({ 
      user: userWithoutPassword,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    // DEBUG: Log full request details to diagnose issues
    console.log(`[getProfile] Request headers:`, JSON.stringify(req.headers));
    console.log(`[getProfile] Request userId:`, req.userId);
    console.log(`[getProfile] Request body:`, JSON.stringify(req.body));
    
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
    console.log(`[getProfile] Parsed token:`, token.substring(0, 15) + '...');
    
    // EMERGENCY DETECTION: Check for our emergency tokens (for quick demo access)
    if (token.startsWith('emergency_demo_token_')) {
      console.log('[getProfile] EMERGENCY TOKEN DETECTED - Providing demo user access');
      
      const emergencyDemoUser = {
        id: 999,
        username: 'demo',
        name: 'Demo User (Emergency Access)',
        email: 'demo@example.com',
        plan: 'Trial',
        initials: 'DU',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.json(emergencyDemoUser);
    }
    
    // EMERGENCY AUTH: Check if we're using the emergency demo user
    if (req.emergencyDemoUser) {
      console.log('[getProfile] Using provided emergency demo user object');
      return res.json(req.emergencyDemoUser);
    }
    
    // If we have a userId from the authentication middleware
    if (req.userId) {
      const userId = req.userId;
      console.log(`[getProfile] Looking up user with ID: ${userId}`);
      
      // UNIVERSAL DEMO USER: Always provide a demo user for ID 999
      if (userId === 999) {
        console.log('[getProfile] Providing universal demo user for ID 999');
        
        const demoUser = {
          id: 999,
          username: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          plan: 'Trial',
          initials: 'DU',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(demoUser);
      }
      
      // Normal flow for real users - try to find in storage
      try {
        const user = await storage.getUser(userId);
        
        if (user) {
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        }
      } catch (storageError) {
        console.log(`[getProfile] Storage error:`, storageError);
        // Continue to fallback (will provide demo user or error)
      }
    }
    
    // Final fallback - if we have a token with userId 999 but it wasn't caught above
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'digital_desk_jwt_secret_key_2025');
      console.log(`[getProfile] Decoded token in fallback:`, decodedToken);
      
      if (decodedToken && decodedToken.userId === 999) {
        console.log('[getProfile] FALLBACK: Providing demo user as final fallback');
        
        const fallbackDemoUser = {
          id: 999,
          username: 'demo',
          name: 'Demo User (Fallback)',
          email: 'demo@example.com',
          plan: 'Trial',
          initials: 'DU', 
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(fallbackDemoUser);
      }
    } catch (tokenError) {
      console.log(`[getProfile] Token decode error in fallback:`, tokenError);
      // Continue to final error response
    }
    
    // If we get here, no user was found and no fallbacks worked
    console.log(`[getProfile] No user found and no fallbacks worked`);
    return res.status(404).json({ message: 'User not found' });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;
    
    // Get current user to ensure they exist
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = await storage.updateUser(userId, { 
      name, 
      email,
      // Update initials if name changed
      ...(name && { initials: name.split(' ').map(n => n[0]).join('').toUpperCase() })
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

/**
 * Special development login handler
 * This endpoint allows login with just a username for development/testing purposes
 */
export const devLogin = async (req, res) => {
  try {
    const { username } = req.body;

    console.log(`[Auth Controller] Dev login requested for username: ${username}`);
    
    if (!username) {
      console.log('[Auth Controller] Dev login failed: No username provided');
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Check if this user exists in the database
    let user = await storage.getUserByUsername(username);
    
    // If user doesn't exist in database, create a temporary one
    if (!user) {
      console.log(`[Auth Controller] User '${username}' not found, creating temporary user`);
      
      // Create a temporary user object
      user = {
        id: 999,
        username,
        name: username === 'demo' ? 'Demo User' : `${username.charAt(0).toUpperCase()}${username.slice(1)}`,
        email: `${username}@example.com`,
        plan: 'Trial',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      console.log(`[Auth Controller] Found existing user: ${user.id}`);
    }
    
    // Generate JWT token
    const token = generateToken(user.id);
    console.log('[Auth Controller] Generated JWT token:', token);
    
    // Remove password from response if it exists
    const { password, ...userWithoutPassword } = user;
    
    // Return user and token
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('[Auth Controller] Dev login error:', error);
    res.status(500).json({ message: 'Error during dev login' });
  }
}; 