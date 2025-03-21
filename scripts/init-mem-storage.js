/**
 * Initialization script for in-memory storage
 * This creates a demo user with bcrypt-hashed password
 */

import bcrypt from 'bcrypt';
import { MemStorage } from '../server/storage.ts';

const initializeStorage = async () => {
  try {
    console.log('Creating demo user with MemStorage...');
    
    // Create a fresh instance of MemStorage
    const memStorage = new MemStorage();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Create a demo user
    const user = await memStorage.createUser({
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
    const brainDump = await memStorage.createBrainDump({
      userId: user.id,
      content: 'This is a sample brain dump for the demo user.'
    });
    console.log('Created sample brain dump');
    
    // Create a sample problem tree
    const problemTree = await memStorage.createProblemTree({
      userId: user.id,
      title: 'Sample Problem Tree',
      description: 'This is a sample problem tree',
      problem: 'Main problem description',
      causes: ['Cause 1', 'Cause 2'],
      effects: ['Effect 1', 'Effect 2'],
      solutions: ['Solution 1', 'Solution 2']
    });
    console.log('Created sample problem tree');
    
    // Create a sample drafted plan
    const draftedPlan = await memStorage.createDraftedPlan({
      userId: user.id,
      title: 'Sample Plan',
      description: 'This is a sample drafted plan',
      goals: ['Goal 1', 'Goal 2'],
      steps: ['Step 1', 'Step 2'],
      timeline: 'Q2 2025',
      status: 'active'
    });
    console.log('Created sample drafted plan');

    console.log('Memory storage initialization completed successfully!');
    console.log('Note: This script creates a standalone instance of MemStorage and does not affect the running application.');
    console.log('To use these credentials in the application, you need to restart it and use the dev-login feature.');
  } catch (error) {
    console.error('Initialization failed:', error);
    console.error(error);
  }
};

// Run the initialization
initializeStorage();