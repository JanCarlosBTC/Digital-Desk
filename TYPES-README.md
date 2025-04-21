# TypeScript Type Augmentation in Digital Desk

## Express Request Augmentation

Express middleware like our authentication system adds properties to the `Request` object. To ensure TypeScript properly recognizes these properties, we use declaration merging to extend Express types.

### Implementation Details

1. Created a declaration file at `server/types/express.d.ts`:
```typescript
declare namespace Express {
  interface Request {
    userId?: number;
  }
}
```

2. Updated `tsconfig.server.json` to include custom type roots:
```json
"compilerOptions": {
  // ...other options
  "typeRoots": ["./node_modules/@types", "./server/types"]
}
```

3. Removed redundant type declarations from `routes.ts` to prevent conflicts.

### Benefits of This Approach

- **Type Safety**: TypeScript properly validates `userId` property across the entire codebase
- **Minimal Code Changes**: No need to modify every route handler function signature
- **Standard Practice**: Follows recommended TypeScript patterns for Express augmentation
- **Maintainability**: Makes it clear to new developers that `userId` is available on requests
- **Consistency**: Maintains the Express middleware pattern where data is attached to the request

### Alternative (Less Maintainable) Approaches

1. **Manual Type Assertion**:
   ```typescript
   (req as Request & { userId: number }).userId
   ```
   This clutters the code and requires repetition everywhere.

2. **Function Parameter Pattern**:
   ```typescript
   function handleEndpoint(userId: number, req: Request, res: Response) { ... }
   ```
   This would require restructuring all route handlers and the middleware system.

3. **Namespace Declaration**:
   ```typescript
   // Extend the Express Request type to include userId property
   namespace Express {
     interface Request {
       userId?: number;
     }
   }
   ```
   This approach works but can lead to duplicate declarations and is less maintainable.

The current implementation is the most sustainable and follows TypeScript best practices.