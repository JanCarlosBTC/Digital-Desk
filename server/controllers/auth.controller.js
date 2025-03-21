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
    
    console.log(`Login attempt for username: ${username}`);
    
    // Find user
    const user = await storage.getUserByUsername(username);
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
    const userId = req.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
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