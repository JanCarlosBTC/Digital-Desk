/**
 * Initialization script for in-memory storage
 * This creates a demo user with bcrypt-hashed password
 */

import bcrypt from 'bcrypt';
import { MemStorage } from '../server/storage.js';

async function initializeStorage() {
  try {
    console.log('Creating demo user with MemStorage...');
    
    // Create a new in-memory storage
    const storage = new MemStorage();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Create a demo user
    const user = await storage.createUser({
      username: 'demo',
      password: hashedPassword,
      name: 'John Doe',
      email: 'demo@example.com',
      plan: 'Trial',
      initials: 'JD'
    });
    
    console.log(`Created demo user: ${user.name} (${user.username}), ID: ${user.id}`);
    console.log('Login credentials: username="demo", password="password"');
    
    // Create sample brain dump for demo user
    const brainDump = await storage.createBrainDump({
      userId: user.id,
      content: 'This is a sample brain dump for the demo user.'
    });
    console.log('Created sample brain dump');

    console.log('Memory storage initialization completed successfully!');
    console.log('Note: Since this is in-memory storage, you will need to restart the application to use these credentials.');
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

// Run the initialization
initializeStorage();