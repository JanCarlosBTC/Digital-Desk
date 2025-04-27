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

// Type for vite config object
type ViteConfigObject = {
  plugins: any[];
  resolve: {
    alias: {
      [key: string]: string;
    };
  };
  root: string;
  build: {
    outDir: string;
    emptyOutDir: boolean;
  };
};

// Create an enhanced require function that can handle specific files
const enhancedRequire = (id: string): any => {
  // Special handling for vite.config.js
  if (id === '../vite.config' || id.endsWith('/vite.config.js')) {
    console.log('Intercepting require for vite.config.js');
    
    // Return a hardcoded config object that mirrors our vite.config.ts
    const viteConfig: ViteConfigObject = {
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
    
    return viteConfig;
  }
  
  // Default behavior for other requires
  return originalRequire(id);
};

export { enhancedRequire as require, __filename, __dirname };

// We need to use a different approach for TypeScript compatibility
// Rather than directly trying to replace the Node.js globals,
// we'll use a type augmentation approach

// Augment the global scope with our types
declare global {
  // We're not redefining require/module here, just augmenting
  interface NodeRequire {
    // Additional properties for our custom require function
    __enhanced?: boolean;
  }
  
  interface NodeModule {
    // Additional properties for module if needed
    __enhanced?: boolean;
  }
}

// This extends the global objects with our implementations
// without causing TypeScript errors about incompatible types
(globalThis.require as any) = enhancedRequire;
(globalThis.require as any).__enhanced = true;
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;

// Patch global variables for libraries that expect CommonJS environment
if (typeof module === 'undefined') {
  (globalThis as any).module = { exports: {}, __enhanced: true };
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
  console.error('Warning: Could not create symlinks. This may be normal in some environments.');
}

// Log the compatibility setup
console.log('ES Module compatibility layer installed');