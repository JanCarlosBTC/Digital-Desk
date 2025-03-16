#!/bin/bash

# Create a temporary file
cp server/storage.ts server/storage.ts.bak

# Pattern 1: Remove simple logActivity calls
grep -v "await this.logActivity" server/storage.ts.bak > server/storage.ts

# Pattern 2: Remove commented activity creation sections
sed -i '/\/\/ Create activity/d' server/storage.ts

# Clean up temporary file
rm server/storage.ts.bak

echo "logActivity calls removed"
