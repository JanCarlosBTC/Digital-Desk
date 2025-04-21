// Compatibility module for ES modules
// This provides a require function for ES modules context

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a require function that works in ES modules
const originalRequire = createRequire(import.meta.url);

// Get the actual project root
const projectRoot = resolve(__dirname, '..');

// Create an enhanced require function that can handle specific files
const enhancedRequire = (id) => {
  // Special handling for vite.config.js
  if (id === '../vite.config' || id.endsWith('/vite.config.js')) {
    console.log('Intercepting require for vite.config.js');
    
    // Return a hardcoded config object that mirrors our vite.config.ts
    return {
      plugins: [],
      resolve: {
        alias: {
          '@': resolve(projectRoot, 'client', 'src'),
          '@shared': resolve(projectRoot, 'shared'),
        }
      },
      root: resolve(projectRoot, 'client'),
      build: {
        outDir: resolve(projectRoot, 'dist/public'),
        emptyOutDir: true
      }
    };
  }
  
  // Default behavior for other requires
  return originalRequire(id);
};

export const require = enhancedRequire;
export { __filename, __dirname };

// Install compatibility layer into global scope
// This allows other modules to use require without importing it
globalThis.require = enhancedRequire;
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;

// Patch global variables for libraries that expect CommonJS environment
if (typeof module === 'undefined') {
  // @ts-expect-error - creating module for CommonJS compatibility
  globalThis.module = { exports: {} };
}

// Create symlinks if they don't exist to ensure proper file access
try {
  // Make sure client files are accessible where the server is looking for them
  const targetClientDir = resolve(projectRoot, 'client');
  const currentDir = process.cwd();
  
  // Only create symlinks if they don't already exist
  if (!fs.existsSync(join(currentDir, 'client'))) {
    fs.symlinkSync(targetClientDir, join(currentDir, 'client'), 'dir');
  }
} catch (error) {
  // Silent fail - symlinks might already exist or we don't have permission
}

// Log the compatibility setup
console.log('ES Module compatibility layer installed');