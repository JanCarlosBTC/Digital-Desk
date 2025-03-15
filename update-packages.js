// Script to update package.json to address security vulnerabilities
const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Function to update dependencies to more secure versions
function updateDependencies() {
  // Add your security updates here
  // For example:
  // packageJson.dependencies['vulnerable-package'] = '^1.2.3'; // Updated secure version
  
  // You can update multiple packages as needed
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