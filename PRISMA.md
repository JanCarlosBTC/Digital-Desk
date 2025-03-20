# Prisma Integration for Digital Desk in Replit

This guide explains how to work with Prisma ORM in the Digital Desk application within the Replit environment.

## Overview

The Digital Desk application has migrated from Drizzle ORM to Prisma ORM. This guide provides specific instructions for working with Prisma in the Replit environment.

## Replit-Specific Configuration

In Replit, the application is configured to use Prisma ORM by default. The database connection is automatically set up using the `DATABASE_URL` environment variable provided by Replit.

### Key Files

- **Schema:** `prisma/schema.prisma` - Contains the database schema definition
- **Client:** `server/prisma.ts` - Prisma client singleton for the application
- **Storage Implementation:** `server/prisma-storage.ts` - Implementation of the storage interface using Prisma
- **Initialization Script:** `scripts/init-prisma-db.ts` - Creates initial data for a new database
- **Type Definitions:** `shared/prisma-schema.ts` - TypeScript types for Prisma models

## Working with Prisma in Replit

### 1. Database Access

The project is already configured to use PostgreSQL with Prisma. The `DATABASE_URL` environment variable is automatically set by Replit.

### 2. Querying Data with Prisma

When working with database queries, use the Prisma storage implementation:

```typescript
// Example: Fetching a user by ID
import { prismaStorage } from '../server/prisma-storage';

async function getUser(id: number) {
  const user = await prismaStorage.getUser(id);
  return user;
}
```

### 3. Schema Modifications

If you need to modify the database schema:

1. Edit the `prisma/schema.prisma` file
2. Run database push command:

```bash
npx prisma db push
```

**Important:** Do not run migrations directly in Replit. Use the `db push` approach which is safer in this environment.

### 4. Types and Models

When working with TypeScript, use the types defined in `shared/prisma-schema.ts`:

```typescript
import { User, InsertUser } from '../shared/prisma-schema';

// Example function that accepts Prisma model types
function processUser(user: User, newData: Partial<InsertUser>) {
  // Your logic here
}
```

### 5. Database Debugging

To debug database issues in Replit:

1. Use the SQL execution tool in Replit to run direct queries
2. Check the console logs for Prisma errors
3. Inspect the state of the database using simple SELECT queries

Example debug query using the SQL tool:

```sql
SELECT * FROM "User" LIMIT 10;
```

## Working with the Storage Interface

The application uses a storage interface defined in `server/storage.ts` with a Prisma implementation in `server/prisma-storage.ts`. All database operations should go through this interface for consistency.

### Key Interface Methods

```typescript
// User methods
getUser(id: number): Promise<User | undefined>;
getUserByUsername(username: string): Promise<User | undefined>;
createUser(user: InsertUser): Promise<User>;
updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;

// (Other entity methods follow the same pattern)
```

## Known Issues and Troubleshooting

### Type Mismatches

There are some type compatibility issues between the Drizzle models and Prisma models. These have been addressed in the Prisma schema, but you may encounter linter errors in the following areas:

1. **Optional vs. Required Fields**: Prisma has stricter typing for null vs. undefined values. Ensure required fields have default values if needed.

2. **Array Types**: Ensure array fields are properly defined in Prisma schema with the correct element types.

3. **DateTime Handling**: Prisma has specific handling for date fields, which may differ from Drizzle.

4. **JSON Fields**: When working with JSON fields, ensure the expected structure matches the Prisma typing.

If you encounter linter errors, you may need to update your schema or add type assertions where appropriate.

### Database Connection

When setting up your database connection, ensure:

- The PostgreSQL server is running and accessible
- The database exists - you may need to create it manually
- The connection string is formatted correctly
- The user has sufficient permissions 

### Common Commands

```
# General prisma commands
npx prisma generate  # Generate client after schema changes
npx prisma db push   # Update database schema without migrations
npx prisma studio    # Visual database explorer

# Migration commands
npx prisma migrate dev    # Create and apply migrations in development
npx prisma migrate deploy # Apply existing migrations in production
```

## Testing the Migration

1. Start the application with the `DATABASE_URL` set:

```bash
$env:DATABASE_URL="postgresql://user:password@localhost:5432/digital_desk" # PowerShell
# or 
export DATABASE_URL="postgresql://user:password@localhost:5432/digital_desk" # Bash/Zsh
npm run dev
```

2. Verify that all functionality works as expected with Prisma

## Reverting to Drizzle

If you need to revert to Drizzle, simply clear the `DATABASE_URL` environment variable:

```bash
$env:DATABASE_URL="" # PowerShell
# or
unset DATABASE_URL  # Unix/Linux/Mac
```

Then restart the application. 