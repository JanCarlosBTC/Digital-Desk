# Error Handling Guide for Digital Desk

This guide provides comprehensive information about the error handling and logging strategy implemented in Digital Desk.

## Error Handling Principles

1. **Fail Gracefully**: Applications should never crash completely. All errors should be caught and handled appropriately.
2. **Inform Users**: Users should receive clear, actionable error messages when something goes wrong.
3. **Log Details**: Detailed error information should be logged for debugging purposes.
4. **Security First**: Error responses should never expose sensitive information.

## Logging Strategy

### Logger Configuration

Digital Desk uses Pino for logging with the following configuration:

- **Development**: Pretty-printed, colorized logs with DEBUG level
- **Production**: JSON-formatted logs with INFO level for better machine parsing

```typescript
// server/logger.ts
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: undefined,
});
```

### Log Levels

Proper log levels help in filtering and prioritizing log messages:

- **ERROR**: Critical issues requiring immediate attention
- **WARN**: Potential issues that don't affect functionality but should be noted
- **INFO**: General operational information about system functions
- **DEBUG**: Detailed information for debugging (development only)
- **TRACE**: Very detailed information (development only)

### Request Logging

All HTTP requests are logged using the `requestLogger` middleware:

```typescript
// server/middleware/logger.ts
export function requestLogger(req: LoggingRequest, res: Response, next: NextFunction) {
  // Log details about the HTTP request with appropriate level based on status code
  // ...
}
```

## Error Handling Implementation

### Global Error Handler

The Express error handler middleware catches unhandled errors:

```typescript
// server/middleware/errorHandler.ts
export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logger.error({ err, req }, `Error: ${err.message}`);
  
  // Send appropriate response
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
}
```

### API Error Responses

API errors follow a consistent structure:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      // Optional additional information
    }
  }
}
```

### Client-Side Error Handling

React components use error boundaries to catch rendering errors:

```tsx
// In client components
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

### Error Codes

Digital Desk uses standardized error codes to categorize errors:

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource conflict | 409 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## Monitoring and Alerting

In production environments:

1. Error logs are monitored for critical issues
2. 5xx errors trigger alerts to the development team
3. Error patterns are analyzed to identify recurring issues

## Error Handling Best Practices

1. **Catch Specific Errors**: Catch specific error types rather than using catch-all handlers
2. **Preserve Stack Traces**: When re-throwing errors, use `Error.captureStackTrace` to preserve the stack
3. **Structured Logging**: Use structured logging with context objects
4. **Validation Early**: Validate input data early to prevent deeper errors
5. **Transaction Safety**: Use database transactions to ensure data consistency

## Debugging Production Issues

1. Use the request ID present in logs to trace the complete flow
2. Check log timestamps to understand the sequence of events
3. Correlate client-side errors with server logs
4. Use the database helper script for database diagnostics:

```bash
./scripts/run.sh db diagnose
```