import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

// This file is currently not being used and can be removed
// It was only added as part of implementing Drizzle ORM
// But we've decided to stick with Prisma instead

// This is kept for reference in case we want to implement Drizzle in the future
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });