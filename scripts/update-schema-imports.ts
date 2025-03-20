import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const updateImports = async () => {
  try {
    // Find all TypeScript files
    console.log('Finding TypeScript files...');
    const files = await glob('**/*.{ts,tsx}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**', 'scripts/update-schema-imports.ts']
    });
    console.log(`Found ${files.length} TypeScript files`);

    let updatedCount = 0;
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Replace imports from @shared/schema with @shared/prisma-schema
        const updatedContent = content.replace(
          /from ['"]@shared\/schema['"]/g,
          'from "@shared/prisma-schema"'
        ).replace(
          /from ['"]\.\.\/shared\/schema['"]/g,
          'from "../shared/prisma-schema"'
        );

        if (content !== updatedContent) {
          console.log(`Updating imports in ${file}`);
          writeFileSync(file, updatedContent);
          updatedCount++;
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Total files scanned: ${files.length}`);
    console.log(`- Files updated: ${updatedCount}`);
  } catch (err) {
    console.error('Error running script:', err);
    process.exit(1);
  }
};

updateImports().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 