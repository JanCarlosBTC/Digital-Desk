# Error Handling Guide for Digital Desk

This document provides a comprehensive guide to error handling in the Digital Desk application, consolidating best practices, component usage, and recovery strategies.

## Error Classification System

Digital Desk uses a categorized approach to error handling, allowing for customized recovery strategies and user feedback.

### Error Categories

Errors are classified into the following categories:

1. **Network** - Connection issues, timeouts, offline states
2. **API** - Failed requests, server responses, fetch errors
3. **Render** - React rendering problems, maximum update depth, invalid hook calls
4. **State** - State management issues, context problems 
5. **Validation** - Form validation, schema errors, invalid input
6. **Resource** - Missing resources, 404 errors, file not found
7. **Authentication** - Login issues, session expiry, token problems
8. **Authorization** - Permission issues, access control
9. **Unknown** - Uncategorized errors

### Error Severity Levels

Errors are also classified by severity:

- **Low** - Non-critical, minimal impact on user experience
- **Medium** - Affects functionality but doesn't prevent core operations
- **High** - Significantly impacts user workflow
- **Critical** - Prevents application from functioning properly

## Components and Tools

### Error Boundary Component

The `ErrorBoundary` component (`client/src/components/error-boundary.tsx`) catches JavaScript errors in the component tree below it and displays a fallback UI.

#### Usage:

```jsx
<ErrorBoundary 
  fallback={<CustomErrorComponent />}  // Optional custom fallback
  onError={(error, errorInfo) => logError(error, errorInfo)}  // Optional error handler
  resetOnPropsChange={true}  // Reset when props change (default: false)
  showResetButton={true}  // Show reset button (default: true)
  showHomeButton={true}  // Show home button (default: false)
  showBackButton={true}  // Show back button (default: false)
>
  <YourComponent />
</ErrorBoundary>
```

### Error State Components

The application provides several pre-built components for showing error states:

1. **ErrorState** - Generic error display with retry option
2. **NetworkError** - Specific display for network issues

#### Usage:

```jsx
<ErrorState 
  title="Unable to Load"
  message="There was a problem loading your data"
  onRetry={() => refetch()}
  variant="destructive"  // 'destructive' or 'default'
/>

<NetworkError 
  message="Please check your internet connection"
  onRetry={() => refetch()}
/>
```

### Error Utility Hooks

#### useErrorHandler

A hook for standardized error handling with toast notifications.

```jsx
const errorHandler = useErrorHandler();

// In a try/catch block
try {
  // Your code
} catch (error) {
  errorHandler(error, "Custom Error Title");
}
```

#### useErrorBoundary

A hook providing error handling capabilities:

```jsx
const { handleError, captureException, logEvent } = useErrorBoundary();

// Handle an error with toast notification
handleError(new Error("Something went wrong"));

// Capture exception with metadata
captureException(error, { userId: 123, action: "checkout" });

// Log non-error events
logEvent("User performed action", { actionId: 456 });
```

## Error Recovery Strategies

The application implements different recovery strategies based on error categories:

1. **Network/API Errors**
   - Automatic retry after delay
   - Toast notification with retry option
   - Connection status monitoring

2. **Authentication/Authorization Errors**
   - Redirect to login
   - Silent token refresh
   - Session management

3. **Validation Errors**
   - Field-level error display
   - Form reset options
   - Validation guidance

4. **Render/State Errors**
   - Component reset
   - State cleanup
   - Fallback UI

5. **Resource Errors**
   - Navigation options
   - Alternative resource suggestions
   - Clear cache/local data

## Best Practices

1. **Always use ErrorBoundary components**
   - Wrap route-level components
   - Wrap critical UI sections
   - Provide meaningful fallbacks

2. **Implement retry mechanisms**
   - Use exponential backoff for retries
   - Limit retry attempts
   - Show progress to users

3. **Provide clear user feedback**
   - Use toast notifications for transient errors
   - Inline errors for form fields
   - Modal dialogs for blocking errors

4. **Log errors properly**
   - Include error ID for tracking
   - Capture stack traces and component info
   - Include user context when appropriate

5. **Recover gracefully**
   - Implement recovery strategies based on error type
   - Provide navigation options
   - Preserve user input when possible

## Implementation Examples

### API Request Error Handling

```typescript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }
    return await response.json();
  } catch (error) {
    errorHandler(error, "Data Fetch Failed");
    return null;
  }
};
```

### Form Validation Error Handling

```typescript
const onSubmit = async (data) => {
  try {
    const validatedData = schema.parse(data);
    await submitToApi(validatedData);
    toast({
      title: "Success",
      description: "Your changes have been saved"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors specifically
      setFormErrors(error.flatten().fieldErrors);
    } else {
      // Handle other errors
      errorHandler(error, "Save Failed");
    }
  }
};
```

### Network Error Recovery

```typescript
const { data, error, refetch } = useQuery({
  queryKey: ['userData'],
  queryFn: fetchUserData,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
});

if (error) {
  return (
    <NetworkError 
      message="Unable to load user data. Please check your connection."
      onRetry={() => refetch()}
    />
  );
}
```
