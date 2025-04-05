# Prisma Guide for Digital Desk

This is a quick reference guide for working with Prisma ORM in Digital Desk.

## Key Files

- **Schema:** `prisma/schema.prisma` - Database schema definition
- **Client:** `server/prisma.ts` - Prisma client singleton
- **Storage:** `server/prisma-storage.ts` - Storage interface implementation 
- **Types:** `shared/prisma-schema.ts` - TypeScript types

## Common Usage Patterns

### Accessing Database via Storage Interface

Always use the PrismaStorage implementation for database operations:

```typescript
// In server routes or services
import { prismaStorage } from '../server/prisma-storage';

// Example: Get user
const user = await prismaStorage.getUser(userId);

// Example: Create entity
const newPriority = await prismaStorage.createPriority({
  userId: req.user.id,
  title: data.title,
  importance: data.importance,
  deadline: data.deadline ? new Date(data.deadline) : null
});
```

### Schema Modifications

To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run the command: `npx prisma db push`

**Never** use manual SQL migrations or Drizzle migration methods.

### Common Issues

1. **Type Mismatches:** Ensure your data matches the expected types in the Prisma schema
2. **Dates:** Always use JavaScript Date objects for date fields
3. **Nullable Fields:** Check for null/undefined values in optional fields
4. **Nested Data:** Use appropriate include statements for relations

## Troubleshooting

### Common Errors

1. **Unknown field:** Check if the field exists in your schema
2. **Type error:** Ensure field values match the expected types
3. **Invalid relation:** Check that related records exist before referencing them

### Database Inspection

Use the provided SQL execution tool to examine the database:

```sql
-- View table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User';

-- Check data
SELECT * FROM "User" LIMIT 10;
```

## Migration from Drizzle

The application has migrated from Drizzle ORM to Prisma ORM. Key differences:

1. **Type System:** Prisma has stricter typing than Drizzle
2. **Optional Fields:** Handle null/undefined consistently 
3. **Relations:** Use include/select in Prisma vs relation in Drizzle
4. **JSON Data:** Prisma handles JSON fields differently

Do not attempt to use Drizzle methods or migration tools with the Prisma schema.
