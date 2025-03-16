import { PrismaClient } from '@prisma/client';
import prisma from '../prisma.js';

type TransactionPrismaClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Executes a callback function within a database transaction
 * Ensures data integrity by committing all operations together or rolling back
 * 
 * @param callback Function to execute within the transaction
 * @returns Result of the callback function
 */
export async function withTransaction<T>(
  callback: (tx: TransactionPrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

/**
 * Utility to safely execute a transaction with error handling
 * Provides automatic rollback on errors
 * 
 * @param callback Function to execute within transaction
 * @returns Result of the transaction or throws an error
 */
export async function executeTransaction<T>(
  callback: (tx: TransactionPrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await withTransaction(callback);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}