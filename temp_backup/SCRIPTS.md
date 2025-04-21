# Digital Desk Scripts Guide

This document provides comprehensive information about the utility scripts available in Digital Desk.

## Script Runner

Digital Desk uses a centralized script runner to execute utility scripts from a unified interface.

### Usage

```bash
./scripts/run.sh <script-name> [args...]
```

Example:

```bash
./scripts/run.sh db reset
```

## Available Scripts

### Database Management

| Script | Description | Example |
|--------|-------------|---------|
| `db reset` | Reset the database (all data will be lost) | `./scripts/run.sh db reset` |
| `db push` | Push schema changes to the database | `./scripts/run.sh db push` |
| `db migrate` | Run a migration to apply schema changes | `./scripts/run.sh db migrate` |
| `db seed` | Seed the database with demo data | `./scripts/run.sh db seed` |
| `db validate` | Validate the database schema | `./scripts/run.sh db validate` |
| `db diagnose` | Run diagnostics on the database connection | `./scripts/run.sh db diagnose` |

### Initialization Scripts

| Script | Description | Example |
|--------|-------------|---------|
| `init-db` | Initialize the database with sample data | `./scripts/run.sh init-db` |
| `init-mem-storage` | Initialize in-memory storage | `./scripts/run.sh init-mem-storage` |
| `init-prisma-db` | Initialize Prisma database | `./scripts/run.sh init-prisma-db` |

### Data Migration

| Script | Description | Example |
|--------|-------------|---------|
| `migrate-to-prisma` | Migrate data from Drizzle to Prisma | `./scripts/run.sh migrate-to-prisma` |

### Maintenance Scripts

| Script | Description | Example |
|--------|-------------|---------|
| `cleanup-logs` | Clean up old log activity | `./scripts/run.sh cleanup-logs` |
| `update-packages` | Update package dependencies | `./scripts/run.sh update-packages` |
| `update-schema-imports` | Update schema imports | `./scripts/run.sh update-schema-imports` |

## Database Helper Script (db-fix.js)

The database helper script provides utilities for common Prisma database operations and fixing common issues.

### Usage

```bash
./scripts/run.sh db <command>
```

Commands:

- `reset` - Reset the database (all data will be lost)
- `push` - Push schema changes to the database
- `migrate` - Run a migration to apply schema changes
- `seed` - Seed the database with demo data
- `validate` - Validate the database schema
- `diagnose` - Run diagnostics on the database connection

Example:

```bash
# Diagnose database connection issues
./scripts/run.sh db diagnose

# Reset the database (WARNING: All data will be lost)
./scripts/run.sh db reset
```

## Custom Script Development

When developing new utility scripts, follow these guidelines:

1. Place the script in the `/scripts` directory
2. Make the script executable (`chmod +x <script-name>`)
3. Add documentation for the script in this guide
4. Register the script in `scripts/index.js` if it should be accessible via the script runner

### Script Template

```javascript
/**
 * Script Name
 * 
 * Description of what this script does.
 * 
 * Usage:
 *   node scripts/script-name.js [args...]
 */

async function main() {
  // Script implementation
  console.log('Script executed successfully');
}

main().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
```