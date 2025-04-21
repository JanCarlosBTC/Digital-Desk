#!/bin/bash

# Run ESLint on the codebase
echo "Running ESLint..."
npx eslint . --ext .js,.jsx,.ts,.tsx
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✅ Linting passed!"
else
  echo "❌ Linting failed!"
fi

exit $exit_code