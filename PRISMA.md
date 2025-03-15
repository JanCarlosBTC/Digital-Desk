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
npm install @prisma/client
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

## Step 6: Migrate Data (if using existing database)

Run the data migration script to transfer data from Drizzle format to Prisma:

```bash
npx ts-node scripts/migrate-to-prisma.ts
```

## Step 7: Update Application to Use Prisma

The application is configured to use Prisma when the `DATABASE_URL` environment variable is set. The implementation automatically switches between in-memory storage and Prisma-based storage.

## Testing the Migration

1. Start the application with the `DATABASE_URL` set:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/digital_desk" npm run dev
```

2. Verify that all functionality works as expected with Prisma

## Troubleshooting

- If you encounter type errors, make sure to run `npx prisma generate` after any schema changes
- For database connection issues, verify your `DATABASE_URL` is correct and accessible
- Check Prisma logs by setting `NODE_ENV=development`

## Reverting to Drizzle

If you need to revert to Drizzle, simply clear the `DATABASE_URL` environment variable:

```bash
unset DATABASE_URL  # for Unix/Linux/Mac
# or
set DATABASE_URL=   # for Windows
```

Then restart the application. 