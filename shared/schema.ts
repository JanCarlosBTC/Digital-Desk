/**
 * @fileoverview Compatibility layer for applications still using the "schema.ts" file
 * 
 * This file re-exports all types and schemas from the prisma-schema.ts file.
 * The project has migrated from Drizzle ORM to Prisma ORM, and this file
 * ensures backward compatibility with code still importing from "schema.ts".
 */

// Re-export everything from the Prisma schema file
export * from './prisma-schema.js';