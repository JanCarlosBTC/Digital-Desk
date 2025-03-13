// List of allowed hosts for Replit environment
module.exports = [
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
