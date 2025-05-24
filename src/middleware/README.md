# Error Handling Middleware

This directory contains centralized error handling middleware for the Techno Ambassador API endpoints.

## Overview

The error handling system provides:

- **Centralized error processing** with consistent response formats
- **Comprehensive error logging** to database with full request context
- **Structured error classification** for monitoring and debugging
- **Helper functions** for common API operations

## Components

### 1. ErrorLogService (`error-log.service.ts`)

Service class for logging errors to the `error_logs` database table with full context.

**Features:**

- Structured error classification with `ErrorType` enum
- Automatic fallback to console logging if database logging fails
- Request context extraction (URL, headers, user agent, etc.)
- Specialized logging methods for different error types

### 2. Error Handler (`error-handler.ts`)

Main middleware providing centralized error handling for API endpoints.

**Features:**

- Custom `ApiError` class with structured error information
- Predefined error constructors (`ApiErrors`) for common scenarios
- Automatic error logging and response formatting
- Helper functions for authentication and request parsing

## Usage Examples

### Basic API Endpoint without Authentication

```typescript
import type { APIContext } from "astro";
import {
  handleApiError,
  parseJsonBody,
  ApiErrors,
} from "../../middleware/error-handler";

export async function POST(context: APIContext): Promise<Response> {
  const { request, locals } = context;
  let requestBody: any;

  try {
    // Step 1: Parse request body
    requestBody = await parseJsonBody(request);

    // Step 2: Validation
    if (!requestBody.name) {
      throw ApiErrors.validation([
        { field: "name", message: "Name is required" },
      ]);
    }

    // Step 3: Business logic
    // ... your business logic here

    // Step 4: Success response
    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Centralized error handling
    return await handleApiError(error, context, undefined, requestBody);
  }
}
```

### API Endpoint with Authentication (Optional)

```typescript
import type { APIContext } from "astro";
import {
  handleApiError,
  parseJsonBody,
  verifyAuthentication,
  ApiErrors,
} from "../../middleware/error-handler";

export async function POST(context: APIContext): Promise<Response> {
  const { request, locals } = context;
  let user: any;
  let requestBody: any;

  try {
    // Step 1: Authentication (only for protected endpoints)
    user = await verifyAuthentication(request, locals.supabase);

    // Step 2: Parse request body
    requestBody = await parseJsonBody(request);

    // Step 3: Validation
    if (!requestBody.name) {
      throw ApiErrors.validation([
        { field: "name", message: "Name is required" },
      ]);
    }

    // Step 4: Business logic with authenticated user
    // ... your business logic here

    // Step 5: Success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Centralized error handling
    return await handleApiError(error, context, user?.id, requestBody);
  }
}
```

### Using Error Wrapper Function

```typescript
import {
  withErrorHandling,
  parseJsonBody,
} from "../../middleware/error-handler";

export const POST = withErrorHandling(async (context: APIContext) => {
  // Your API logic here - errors will be handled automatically
  const { request, locals } = context;

  // Authentication is optional - only add if needed
  // const user = await verifyAuthentication(request, locals.supabase);
  const body = await parseJsonBody(request);

  // Business logic...

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
```

### Manual Error Logging

```typescript
import { ErrorLogService, ErrorType } from "../../services/error-log.service";

export async function POST(context: APIContext): Promise<Response> {
  const errorLogService = new ErrorLogService(context.locals.supabase);

  try {
    // Your API logic here
  } catch (error) {
    // Manual error logging with custom context
    const errorContext = ErrorLogService.createContextFromRequest(
      context.request,
      "user-id-123"
    );

    await errorLogService.logBusinessError(
      "Custom business logic error",
      errorContext,
      ErrorType.BUSINESS_LOGIC_ERROR
    );

    throw ApiErrors.businessLogic("Operation failed");
  }
}
```

## Error Types

The system classifies errors into the following types:

- `VALIDATION_ERROR` - Input validation failures
- `AUTHENTICATION_ERROR` - Authentication failures
- `AUTHORIZATION_ERROR` - Authorization/permission failures
- `BUSINESS_LOGIC_ERROR` - Business rule violations
- `DATABASE_ERROR` - Database operation failures
- `EXTERNAL_API_ERROR` - External service failures
- `INTERNAL_SERVER_ERROR` - Unexpected system errors
- `NOT_FOUND_ERROR` - Resource not found
- `CONFLICT_ERROR` - Data conflicts (duplicates, etc.)

## Predefined Error Constructors

The `ApiErrors` class provides convenient constructors for common error scenarios:

```typescript
// Validation errors
ApiErrors.validation([{ field: "email", message: "Invalid email format" }]);

// Authentication errors
ApiErrors.unauthorized("Invalid token");

// Authorization errors
ApiErrors.forbidden("Insufficient permissions");

// Not found errors
ApiErrors.notFound("User not found");

// Conflict errors
ApiErrors.conflict("Email already exists");

// Business logic errors
ApiErrors.businessLogic("Cannot delete active user", 422);

// Database errors
ApiErrors.database("Connection failed");

// Internal server errors
ApiErrors.internal("Unexpected error occurred");
```

## Response Format

All errors follow a consistent response format:

### Standard Error Response

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

### Validation Error Response

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Best Practices

1. **Always use the centralized error handler** in API endpoints
2. **Use appropriate error types** for proper classification
3. **Provide meaningful error messages** for debugging
4. **Don't expose sensitive information** in error responses
5. **Log errors with full context** for monitoring and debugging
6. **Use predefined error constructors** for consistency
7. **Handle database logging failures gracefully** (automatic fallback to console)

## Monitoring and Debugging

All errors are automatically logged to the `error_logs` database table with:

- Error message and type
- Full request context (URL, headers, user agent)
- User ID (if authenticated)
- Stack trace (for debugging)
- Timestamp

This enables:

- Error rate monitoring
- Performance analysis
- User behavior tracking
- Debugging assistance
- System health monitoring
