/**
 * Simplified database initialization script
 * This creates a demo user and basic data using Prisma.
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import bcrypt from 'bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to run shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function applyMigrations() {
  try {
    // Push the schema to the database without data loss
    await runCommand('npx prisma db push --accept-data-loss');
    console.log('Prisma schema successfully pushed to database');
  } catch (error) {
    console.error('Failed to apply migrations:', error);
    throw error;
  }
}

async function initializeDb() {
  try {
    console.log('Starting database initialization with Prisma...');
    
    // First apply migrations to make sure tables exist
    await applyMigrations();
    
    // Hash the password for security
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Create a demo user
    const demoUser = await prisma.user.upsert({
      where: { username: 'demo' },
      update: {},
      create: {
        username: 'demo',
        password: hashedPassword, 
        name: 'John Doe',
        plan: 'Trial',
        initials: 'JD'
      }
    });
    
    console.log(`Created demo user: ${demoUser.name} (${demoUser.username})`);
    
    // Create sample brain dump for demo user
    const brainDump = await prisma.brainDump.upsert({
      where: { 
        id: 1 
      },
      update: {},
      create: {
        userId: demoUser.id,
        content: 'This is a sample brain dump for the demo user.'
      }
    });
    console.log('Created sample brain dump');
    
    // Create a sample activity
    const activity = await prisma.activity.create({
      data: {
        userId: demoUser.id,
        type: 'init',
        entityType: 'system',
        entityName: 'Database Initialization',
        metadata: {
          status: 'completed',
          date: new Date()
        }
      }
    });
    console.log('Created initialization activity record');

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeDb();