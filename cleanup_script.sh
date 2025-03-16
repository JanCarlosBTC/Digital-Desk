#!/bin/bash

# Remove the temporary logActivity method
sed -i '/\/\/.*Temporary method to avoid compile errors during activity removal/,/^  }/d' server/storage.ts

# Define a pattern for all logActivity blocks
PATTERN='[[:space:]]*// *\(Create activity\|Track activity\)* *\?[[:space:]]*await this\.logActivity({[^}]*});'

# Remove all occurrences of the pattern
sed -i -E ":a;N;$!ba;s/${PATTERN}//g" server/storage.ts

# Handle if (deleted) { await this.logActivity... } blocks
sed -i -E 's/[[:space:]]*if[[:space:]]*\(deleted\)[[:space:]]*{[[:space:]]*await this\.logActivity\({[^}]*}\);[[:space:]]*}//' server/storage.ts

echo "LogActivity calls removed successfully"
