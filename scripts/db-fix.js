#!/usr/bin/env node
/**
 * Prisma Database Helper Script
 * 
 * This script provides utilities for common Prisma database operations
 * and fixing common issues that might arise during development.
 * 
 * Usage:
 *   node scripts/db-fix.js <command>
 * 
 * Commands:
 *   reset      - Reset the database (all data will be lost)
 *   push       - Push schema changes to the database
 *   migrate    - Run a migration to apply schema changes
 *   seed       - Seed the database with demo data
 *   validate   - Validate the database schema
 *   diagnose   - Run diagnostics on the database connection
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command from arguments
const command = process.argv[2];

// Command functions
const commands = {
  reset: () => {
    console.log('Resetting database...');
    return runPrismaCommand(['db', 'push', '--force-reset']);
  },
  
  push: () => {
    console.log('Pushing schema changes to database...');
    return runPrismaCommand(['db', 'push']);
  },
  
  migrate: () => {
    console.log('Running migration...');
    return runPrismaCommand(['migrate', 'dev']);
  },
  
  seed: async () => {
    console.log('Seeding database with demo data...');
    // First run the init-prisma-db.ts script
    await runTsNode(path.resolve(__dirname, './init-prisma-db.ts'));
    return 0;
  },
  
  validate: () => {
    console.log('Validating database schema...');
    return runPrismaCommand(['validate']);
  },
  
  diagnose: async () => {
    console.log('Running database diagnostics...');
    
    try {
      // Check if DATABASE_URL is set
      if (!process.env.DATABASE_URL) {
        console.error('⚠️ DATABASE_URL environment variable is not set');
        console.log('- Make sure to create a .env file based on .env.example');
        console.log('- Set DATABASE_URL to your PostgreSQL connection string');
      } else {
        console.log('✓ DATABASE_URL is set');
      }
      
      // Validate Prisma schema
      console.log('\nValidating Prisma schema...');
      const validateResult = await runPrismaCommand(['validate'], false);
      
      if (validateResult === 0) {
        console.log('✓ Prisma schema is valid');
      } else {
        console.error('⚠️ Prisma schema validation failed');
      }
      
      // Try to connect to database
      console.log('\nTesting database connection...');
      const formatResult = await runPrismaCommand(['format'], false);
      
      if (formatResult === 0) {
        console.log('✓ Database connection successful');
      } else {
        console.error('⚠️ Could not connect to database');
        console.log('- Check that PostgreSQL is running');
        console.log('- Verify your DATABASE_URL is correct');
        console.log('- Ensure the database exists and is accessible');
      }
      
      return 0;
    } catch (error) {
      console.error('Error during diagnostics:', error);
      return 1;
    }
  },
  
  help: () => {
    console.log('Usage: node scripts/db-fix.js <command>');
    console.log('\nCommands:');
    console.log('  reset     - Reset the database (all data will be lost)');
    console.log('  push      - Push schema changes to the database');
    console.log('  migrate   - Run a migration to apply schema changes');
    console.log('  seed      - Seed the database with demo data');
    console.log('  validate  - Validate the database schema');
    console.log('  diagnose  - Run diagnostics on the database connection');
    console.log('  help      - Show this help message');
    return 0;
  }
};

// Helper to run Prisma CLI commands
async function runPrismaCommand(args, showOutput = true) {
  return new Promise((resolve) => {
    const prisma = spawn('npx', ['prisma', ...args], {
      stdio: showOutput ? 'inherit' : 'pipe'
    });
    
    prisma.on('close', (code) => {
      resolve(code);
    });
  });
}

// Helper to run TypeScript files with ts-node
async function runTsNode(filePath) {
  return new Promise((resolve) => {
    const process = spawn('npx', ['ts-node', filePath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      resolve(code);
    });
  });
}

// Execute the requested command
async function run() {
  const cmd = commands[command] || commands.help;
  const exitCode = await cmd();
  process.exit(exitCode);
}

run().catch(error => {
  console.error('Error executing command:', error);
  process.exit(1);
});