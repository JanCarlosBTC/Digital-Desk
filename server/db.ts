/**
 * Database Access Layer
 * 
 * This exports the Prisma client instance and the PostgreSQL pool
 * that should be used throughout the application.
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure Neon connection
const connectionString = process.env.DATABASE_URL;
export const pool = new Pool({ connectionString });

// Initialize Prisma client
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});