// New server entry point that establishes compatibility with ES modules
// This is a workaround for the "require is not defined" error in vite.ts

// Import our compatibility layer first
import './compat.js';

// Then import the actual server code
import './index.js';