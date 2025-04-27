/**
 * Initialization script for in-memory storage
 * This creates a demo user with bcrypt-hashed password
 */

import bcrypt from 'bcrypt';
import { MemStorage } from '../server/storage';
import { InsertUser } from '../shared/schema';

/**
 * Initialize the in-memory storage with sample data
 */
const initializeStorage = async (): Promise<void> => {
  try {
    console.log('Creating demo user with MemStorage...');
    
    // Create a fresh instance of MemStorage
    const memStorage = new MemStorage();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Create demo user data
    const demoUserData: InsertUser = {
      username: 'demo',
      password: hashedPassword,
      name: 'John Doe',
      plan: 'Trial',
      initials: 'JD'
    };
    
    // Create a demo user
    const user = await memStorage.createUser(demoUserData);
    
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
      mainProblem: 'Main problem description',
      subProblems: ['Sub-problem 1', 'Sub-problem 2'],
      rootCauses: ['Cause 1', 'Cause 2'],
      potentialSolutions: ['Solution 1', 'Solution 2'],
      nextActions: ['Action 1', 'Action 2']
    });
    console.log('Created sample problem tree');
    
    // Create a sample drafted plan
    const draftedPlan = await memStorage.createDraftedPlan({
      userId: user.id,
      title: 'Sample Plan',
      description: 'This is a sample drafted plan',
      status: 'Draft',
      components: ['Component 1', 'Component 2'],
      resourcesNeeded: ['Resource 1', 'Resource 2'],
      expectedOutcomes: ['Outcome 1', 'Outcome 2'],
      comments: 0,
      attachments: 0
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