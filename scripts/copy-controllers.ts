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
files.forEach((file: string) => {
  if (file.endsWith('.js') || file.endsWith('.ts')) {
    const sourcePath = path.join(sourceDir, file);
    // For TypeScript files, we need to copy to .js since they'll be compiled
    const destFileName = file.endsWith('.ts') ? file.replace('.ts', '.js') : file;
    const destPath = path.join(destDir, destFileName);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/server/controllers as ${destFileName}`);
  }
});

console.log('Controllers copied successfully!');