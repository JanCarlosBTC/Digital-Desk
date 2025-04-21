#!/bin/bash
# Script Runner for Digital Desk
# 
# This script provides a CLI interface to run various utility scripts
# for the Digital Desk application.
# 
# Usage:
#   ./scripts/run.sh <script-name> [args...]
# 
# Available Scripts:
#   - cleanup-logs         : Clean up old log activity
#   - copy-controllers     : Copy controller files
#   - update-packages      : Update package dependencies
#   - init-db              : Initialize the database with sample data
#   - init-mem-storage     : Initialize memory storage
#   - init-prisma-db       : Initialize Prisma database
#   - migrate-to-prisma    : Migrate data from Drizzle to Prisma
#   - update-schema-imports: Update schema imports

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$1"
shift 1

case "$SCRIPT_NAME" in
  "cleanup-logs")
    node "$SCRIPT_DIR/cleanup_logactivity.js" "$@"
    ;;
  "copy-controllers")
    node "$SCRIPT_DIR/copy-controllers.js" "$@"
    ;;
  "update-packages")
    node "$SCRIPT_DIR/update-packages.js" "$@"
    ;;
  "init-db")
    node "$SCRIPT_DIR/init-db.js" "$@"
    ;;
  "init-mem-storage")
    node "$SCRIPT_DIR/init-mem-storage.js" "$@"
    ;;
  "init-prisma-db")
    npx ts-node "$SCRIPT_DIR/init-prisma-db.ts" "$@"
    ;;
  "migrate-to-prisma")
    npx ts-node "$SCRIPT_DIR/migrate-to-prisma.ts" "$@"
    ;;
  "update-schema-imports")
    npx ts-node "$SCRIPT_DIR/update-schema-imports.ts" "$@"
    ;;
  "")
    echo "Available scripts:"
    echo "  - cleanup-logs"
    echo "  - copy-controllers"
    echo "  - update-packages"
    echo "  - init-db"
    echo "  - init-mem-storage"
    echo "  - init-prisma-db"
    echo "  - migrate-to-prisma"
    echo "  - update-schema-imports"
    exit 0
    ;;
  *)
    echo "Script \"$SCRIPT_NAME\" not found. Available scripts:"
    echo "  - cleanup-logs"
    echo "  - copy-controllers"
    echo "  - update-packages"
    echo "  - init-db"
    echo "  - init-mem-storage"
    echo "  - init-prisma-db"
    echo "  - migrate-to-prisma"
    echo "  - update-schema-imports"
    exit 1
    ;;
esac