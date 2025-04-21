#!/bin/bash

# Run ESLint on the codebase, excluding dist directory and only checking for errors (not warnings)
echo "Running ESLint..."
npx eslint --max-warnings=9999 "./client/src/**/*.{ts,tsx,js,jsx}" "./server/**/*.{ts,tsx,js,jsx}" "./shared/**/*.{ts,tsx,js,jsx}" --ignore-pattern "dist/" 
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✅ Linting passed!"
else
  echo "❌ Linting failed!"
fi

exit $exit_code