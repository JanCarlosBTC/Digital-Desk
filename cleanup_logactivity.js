const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'server/storage.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the temporary logActivity method
content = content.replace(/\s*\/\/\s*Temporary method to avoid compile errors during activity removal([\s\S]*?)private async logActivity\(data: any\): Promise<void> {[\s\S]*?return;[\s\S]*?}/m, '');

// Regular expression to match all logActivity blocks
const logActivityPattern = /\s*\/\/\s*(?:Create activity|Track activity)?\s*await this\.logActivity\(\{\s*userId:.*?\s*type:.*?\s*entityType:.*?\s*entityName:.*?\s*metadata:[\s\S]*?\}\);/g;

// Remove all occurrences
content = content.replace(logActivityPattern, '');

// Replace if (deleted) { await this.logActivity... } blocks with just return deleted;
content = content.replace(/\s*if\s*\(deleted\)\s*\{\s*await this\.logActivity\(\{[\s\S]*?\}\);\s*\}\s*\s*return deleted;/g, '    return deleted;');

fs.writeFileSync(filePath, content, 'utf8');
console.log('LogActivity calls removed successfully');
