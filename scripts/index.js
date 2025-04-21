#!/usr/bin/env node
/**
 * Script Runner for Digital Desk
 * 
 * This script provides a CLI interface to run various utility scripts
 * for the Digital Desk application.
 * 
 * Usage:
 *   node scripts/index.js <script-name> [args...]
 * 
 * Available Scripts:
 *   - cleanup-logs         : Clean up old log activity
 *   - copy-controllers     : Copy controller files
 *   - update-packages      : Update package dependencies
 *   - init-db              : Initialize the database with sample data
 *   - init-mem-storage     : Initialize memory storage
 *   - init-prisma-db       : Initialize Prisma database
 *   - migrate-to-prisma    : Migrate data from Drizzle to Prisma
 *   - update-schema-imports: Update schema imports
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptName = process.argv[2];
const scriptArgs = process.argv.slice(3);

// Map of script names to file paths
const scripts = {
  'cleanup-logs': './cleanup_logactivity.js',
  'copy-controllers': './copy-controllers.js',
  'update-packages': './update-packages.js',
  'init-db': './init-db.js',
  'init-mem-storage': './init-mem-storage.js',
  'init-prisma-db': './init-prisma-db.ts',
  'migrate-to-prisma': './migrate-to-prisma.ts',
  'update-schema-imports': './update-schema-imports.ts'
};

if (!scriptName) {
  console.log('Available scripts:');
  Object.keys(scripts).forEach(name => {
    console.log(`  - ${name}`);
  });
  process.exit(0);
}

if (!scripts[scriptName]) {
  console.error(`Script "${scriptName}" not found. Available scripts:`);
  Object.keys(scripts).forEach(name => {
    console.error(`  - ${name}`);
  });
  process.exit(1);
}

const scriptPath = path.resolve(__dirname, scripts[scriptName]);
const ext = path.extname(scriptPath);

let command, args;
if (ext === '.ts') {
  command = 'npx';
  args = ['ts-node', scriptPath, ...scriptArgs];
} else {
  command = 'node';
  args = [scriptPath, ...scriptArgs];
}

console.log(`Running script: ${scriptName}`);
const child = spawn(command, args, { stdio: 'inherit' });

child.on('close', code => {
  process.exit(code);
});