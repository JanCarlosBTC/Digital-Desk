#!/bin/bash

# Digital Desk Script Runner
# This script provides a unified interface to run utility scripts

# Change to project root directory
cd "$(dirname "$0")/.." || exit 1

# Set environment variables from .env file if it exists
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Display help message if no arguments are provided
if [ $# -eq 0 ]; then
  echo "Digital Desk Script Runner"
  echo ""
  echo "Usage: ./scripts/run.sh <script-name> [args...]"
  echo ""
  echo "Available scripts:"
  echo "  db <command>              - Database management commands (reset, push, migrate, seed, validate, diagnose)"
  echo "  init-db                   - Initialize the database with sample data"
  echo "  init-mem-storage          - Initialize in-memory storage"
  echo "  init-prisma-db            - Initialize Prisma database"
  echo "  migrate-to-prisma         - Migrate data from Drizzle to Prisma"
  echo "  cleanup-logs              - Clean up old log activity"
  echo "  update-packages           - Update package dependencies"
  echo "  update-schema-imports     - Update schema imports"
  echo ""
  echo "For more information, see SCRIPTS.md"
  exit 0
fi

SCRIPT_NAME=$1
shift

# Execute script based on name
case "$SCRIPT_NAME" in
  db)
    node scripts/db-fix.js "$@"
    ;;
  init-db)
    node scripts/init-db.js "$@"
    ;;
  init-mem-storage)
    node scripts/init-mem-storage.js "$@"
    ;;
  init-prisma-db)
    npx ts-node scripts/init-prisma-db.ts "$@"
    ;;
  migrate-to-prisma)
    npx ts-node scripts/migrate-to-prisma.ts "$@"
    ;;
  cleanup-logs)
    node scripts/cleanup_logactivity.js "$@"
    ;;
  update-packages)
    node scripts/update-packages.js "$@"
    ;;
  update-schema-imports)
    npx ts-node scripts/update-schema-imports.ts "$@"
    ;;
  *)
    # Try to run a script directly via the index.js entry point
    node scripts/index.js "$SCRIPT_NAME" "$@"
    ;;
esac