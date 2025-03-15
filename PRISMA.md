# Migrating from Drizzle to Prisma

This guide explains how to migrate the Digital Desk application from Drizzle ORM to Prisma ORM.

## Overview

The migration process involves:

1. Installing Prisma dependencies
2. Creating a Prisma schema based on existing Drizzle schema
3. Generating Prisma client
4. Implementing Prisma-based storage
5. Migrating data from Drizzle to Prisma

## Prerequisites

- Node.js 16+ installed
- Access to the database (PostgreSQL)
- Environment variable `DATABASE_URL` set with your database connection string

## Step 1: Install Dependencies

```bash
npm install @prisma/client postgres
npm install --save-dev prisma
```

## Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates a `prisma` directory with a basic `schema.prisma` file.

## Step 3: Update Prisma Schema

Replace the generated `schema.prisma` file with our custom schema based on Drizzle models. The schema file is already prepared at `prisma/schema.prisma`.

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

This generates the TypeScript client based on your schema.

## Step 5: Run Migrations

If you're starting with a new database:

```bash
npx prisma migrate dev --name init
```

If you're using an existing database with data:

```bash
npx prisma db push
```

## Step 6: Initialize a New Database (if needed)

If you're starting with a fresh database, you can run the initialization script:

```bash
npx ts-node scripts/init-prisma-db.ts
```

This will create a demo user and some initial data.

## Step 7: Migrate Data (if using existing database)

Run the data migration script to transfer data from Drizzle format to Prisma:

```bash
npx ts-node scripts/migrate-to-prisma.ts
```

## Step 8: Update Application to Use Prisma

The application is configured to use Prisma when the `DATABASE_URL` environment variable is set. The implementation automatically switches between in-memory storage and Prisma-based storage.

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