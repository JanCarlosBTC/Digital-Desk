// This is a systematic cleanup script for removing activity logging code
// Created by hand for the specific patterns used in storage.ts

import fs from 'fs';

// Read the content of storage.ts
const filePath = 'server/storage.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Define the patterns that need to be removed
const patterns: RegExp[] = [
  // Pattern 1: Simple logActivity call blocks with comment
  /\s+\/\/\s*(?:Create|Track) activity\s*\n\s+await this\.logActivity\(\{[\s\S]*?\}\);\s*\n/g,
  
  // Pattern 2: Simple logActivity call blocks without comment
  /\s+await this\.logActivity\(\{[\s\S]*?\}\);\s*\n/g,
  
  // Pattern 3: if (deleted) { await this.logActivity... } blocks
  /\s+if\s*\(deleted\)\s*\{\s*\n\s+await this\.logActivity\(\{[\s\S]*?\}\);\s*\n\s+\}\s*\n/g
];

// Remove each pattern from the content
patterns.forEach(pattern => {
  content = content.replace(pattern, '\n');
});

// Write the cleaned content back to the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('All logActivity calls have been removed from storage.ts');