/**
 * Prisma Client Configuration
 * 
 * This file initializes and exports a singleton instance of Prisma Client
 * used throughout the application for database access.
 * 
 * For comprehensive documentation on Prisma usage, best practices, and troubleshooting,
 * refer to the PRISMA-GUIDE.md file in the root directory.
 */

import { PrismaClient } from '@prisma/client';

// Create a single instance of Prisma Client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use the same instance across hot reloads
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  
  prisma = globalForPrisma.prisma;
}

export default prisma; 