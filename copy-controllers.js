import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the controllers directory exists in dist
const sourceDir = path.join(__dirname, 'server', 'controllers');
const destDir = path.join(__dirname, 'dist', 'server', 'controllers');

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all JavaScript files from server/controllers to dist/server/controllers
const files = fs.readdirSync(sourceDir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/server/controllers`);
  }
});

console.log('Controllers copied successfully!');