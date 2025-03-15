// Script to update package.json to address security vulnerabilities
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Function to update dependencies to more secure versions
function updateDependencies() {
  // Update vulnerable dependencies
  if (packageJson.devDependencies) {
    packageJson.devDependencies['drizzle-kit'] = '^0.19.1'; // Update to more secure version
    packageJson.devDependencies['esbuild'] = '^0.25.2'; // Update to patched version
  }
  
  // Update esbuild-kit dependencies
  if (packageJson.dependencies) {
    packageJson.dependencies['@esbuild-kit/core-utils'] = '^3.3.2'; // Latest version
    packageJson.dependencies['@esbuild-kit/esm-loader'] = '^2.6.5'; // Latest version
  }
  
  console.log('Updated dependencies with secure versions');
}

// Write the updated package.json back to disk
function savePackageJson() {
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );
  console.log('Successfully updated package.json with secure versions');
}

// Execute the update
updateDependencies();
savePackageJson(); 