# Digital Desk Scripts

This document provides information about utility scripts available in the Digital Desk application.

## Running Scripts

There are two ways to run utility scripts:

### Using the Node.js script runner

```
node scripts/index.js <script-name> [args...]
```

### Using the Bash script runner

```
./scripts/run.sh <script-name> [args...]
```

## Available Scripts

| Script Name | Description | Usage |
|-------------|-------------|-------|
| `cleanup-logs` | Cleans up old log activity | `./scripts/run.sh cleanup-logs` |
| `copy-controllers` | Copies controller files | `./scripts/run.sh copy-controllers` |
| `update-packages` | Updates package dependencies | `./scripts/run.sh update-packages` |
| `init-db` | Initializes database with sample data | `./scripts/run.sh init-db` |
| `init-mem-storage` | Initializes memory storage | `./scripts/run.sh init-mem-storage` |
| `init-prisma-db` | Initializes Prisma database | `./scripts/run.sh init-prisma-db` |
| `migrate-to-prisma` | Migrates data from Drizzle to Prisma | `./scripts/run.sh migrate-to-prisma` |
| `update-schema-imports` | Updates schema imports | `./scripts/run.sh update-schema-imports` |

## Database Helper Script

A dedicated script for managing database operations is available:

```
node scripts/db-fix.js <command>
```

### Commands:

| Command | Description |
|---------|-------------|
| `reset` | Reset the database (all data will be lost) |
| `push` | Push schema changes to the database |
| `migrate` | Run a migration to apply schema changes |
| `seed` | Seed the database with demo data |
| `validate` | Validate the database schema |
| `diagnose` | Run diagnostics on the database connection |
| `help` | Show the help message |

## Script Details

### cleanup-logs

Cleans up old log activity files to prevent the logs directory from growing too large.

### copy-controllers

Copies controller files from source to destination, typically used during build or deployment processes.

### update-packages

Updates package.json dependencies to their latest versions. Use with caution as it may break compatibility.

### init-db

Initializes the database with sample data. This is useful for development and testing purposes.

### init-mem-storage

Initializes in-memory storage with demo data. Useful for running the application without a database.

### init-prisma-db

Initializes the Prisma database with basic data structure and sample data.

### migrate-to-prisma

Migrates data from the Drizzle ORM schema to Prisma. This is a one-time operation when transitioning from Drizzle to Prisma.

### update-schema-imports

Updates import statements in files that reference the schema to ensure proper paths and exports are used.

### db-fix.js

The database helper script provides a convenient way to manage common database operations:

- **reset**: Completely resets the database, dropping all tables and recreating them (all data will be lost)
- **push**: Pushes schema changes to the database without creating migrations
- **migrate**: Creates and applies a new migration to track schema changes
- **seed**: Seeds the database with demo data using the init-prisma-db.ts script
- **validate**: Validates that the database schema matches the Prisma schema
- **diagnose**: Runs diagnostics on the database connection and configuration