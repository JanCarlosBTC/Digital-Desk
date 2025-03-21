import { generateToken } from '../middleware/auth.js';

// Demo user object
const demoUser = {
  id: 1,
  username: 'demo',
  name: 'Demo User',
  email: 'demo@example.com',
  plan: 'Trial',
  initials: 'DU',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Simplified registration - always returns the demo user
export const register = async (req, res) => {
  try {
    const token = generateToken(demoUser.id);
    
    res.status(201).json({ 
      user: demoUser,
      token: token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Simplified login - always returns the demo user
export const login = async (req, res) => {
  try {
    const token = generateToken(demoUser.id);
    
    res.json({ 
      user: demoUser,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

// Simplified profile endpoint - always returns the demo user
export const getProfile = async (req, res) => {
  try {
    res.json(demoUser);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Simplified update profile - pretends to update but always returns the demo user
export const updateProfile = async (req, res) => {
  try {
    res.json(demoUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

// Development login - always returns the demo user
export const devLogin = async (req, res) => {
  try {
    const token = generateToken(demoUser.id);
    
    res.json({
      user: demoUser,
      token
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ message: 'Error during dev login' });
  }
}; 