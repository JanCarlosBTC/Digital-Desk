/**
 * Allowed hosts configuration for Replit
 * 
 * This file defines the list of hostnames and patterns that are allowed to 
 * make requests to the application. It's used for CORS and for validating
 * host headers.
 */

// Define the type for allowed hosts
type AllowedHost = string | RegExp;

// List of allowed hosts for Replit environment
const allowedHosts: AllowedHost[] = [
  // Allow specific patterns for Replit domains
  /\.replit\.dev$/,
  /\.repl\.co$/,
  /\.replit\.app$/,
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /^0\.0\.0\.0$/,
  // Add the specific host from the current environment
  '2c99c49c-889f-4ff0-96dc-b25f86062046-00-1ktjncdc9115a.spock.replit.dev',
  // Wildcard to allow any host in debug mode
  '*'
];

export default allowedHosts;