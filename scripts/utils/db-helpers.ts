/**
 * Database Helper Utilities
 * 
 * This module provides common utilities for database operations
 * used by the db-fix script.
 */

import { spawn } from 'child_process';
import path from 'path';

// Type for command result
export type CommandResult = Promise<number>;

/**
 * Runs a Prisma CLI command
 * 
 * @param args - Arguments to pass to Prisma CLI
 * @param showOutput - Whether to show command output
 * @returns Promise resolving to exit code
 */
export async function runPrismaCommand(args: string[], showOutput = true): CommandResult {
  return new Promise<number>((resolve) => {
    const prisma = spawn('npx', ['prisma', ...args], {
      stdio: showOutput ? 'inherit' : 'pipe'
    });
    
    prisma.on('close', (code) => {
      resolve(code ?? 0);
    });
  });
}

/**
 * Runs a TypeScript file with ts-node
 * 
 * @param filePath - Path to TypeScript file
 * @returns Promise resolving to exit code
 */
export async function runTsNode(filePath: string): CommandResult {
  return new Promise<number>((resolve) => {
    const process = spawn('npx', ['ts-node', filePath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      resolve(code ?? 0);
    });
  });
}