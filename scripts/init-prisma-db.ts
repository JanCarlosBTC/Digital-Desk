/**
 * Initialization script for Prisma database
 * 
 * This script initializes the database with a demo user
 * and basic data to get started with Prisma.
 * 
 * Usage: 
 * 1. Ensure DATABASE_URL environment variable is set
 * 2. Run: npx ts-node scripts/init-prisma-db.ts
 */

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function initializeDb() {
  try {
    console.log('Starting database initialization with Prisma...');
    
    // Create a demo user
    const demoUser = await prisma.user.upsert({
      where: { username: 'demo' },
      update: {},
      create: {
        username: 'demo',
        password: 'password', // In a real app, use a hashed password
        name: 'John Doe',
        plan: 'Premium',
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