# Session Management & Protected Resources

This diagram shows how the system handles session validation and access to protected resources.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser
    participant Middleware as Middleware
    participant AstroAPI as Astro API
    participant SupabaseAuth as Supabase Auth
    participant Database as Database

    Note over Browser,Database: Access to Protected Pages

    Browser->>Middleware: GET /dj/dashboard
    activate Middleware
    Middleware->>Middleware: Check session cookies

    alt No session
        Middleware-->>Browser: Redirect to /auth/login (302)
        Note over Browser: No valid session found
    else Session exists
        Middleware->>SupabaseAuth: Verify token
        activate SupabaseAuth

        alt Token expired
            SupabaseAuth->>SupabaseAuth: Refresh token automatically

            alt Refresh failed
                SupabaseAuth-->>Middleware: Invalid token
                Middleware->>Middleware: Clear cookies
                Middleware-->>Browser: Redirect to login (302)
                Note over Browser: Session expired, please login again
            else Token refreshed
                SupabaseAuth-->>Middleware: New token
                Middleware->>Middleware: Update session
                Middleware->>Browser: Continue to protected page (200)
                Note over Browser: New token set in cookies
            end
        else Token valid
            SupabaseAuth-->>Middleware: User data
            Middleware->>Browser: Render protected page (200)
            Note over Browser: Access granted to protected resource
        end
        deactivate SupabaseAuth
    end
    deactivate Middleware

    Note over Browser,Database: Protected API Call

    Browser->>AstroAPI: POST /api/events (Bearer token)
    Note over Browser,AstroAPI: Authorization: Bearer <token>
    activate AstroAPI
    AstroAPI->>AstroAPI: Check Authorization header

    alt No token
        AstroAPI-->>Browser: 401 Unauthorized
        Note over Browser: Missing authorization header
    else Token present
        AstroAPI->>SupabaseAuth: Verify token
        activate SupabaseAuth

        alt Invalid token
            SupabaseAuth-->>AstroAPI: Verification error
            AstroAPI-->>Browser: 401 Unauthorized
            Note over Browser: Invalid or expired token
        else Valid token
            SupabaseAuth-->>AstroAPI: User data + permissions
            AstroAPI->>Database: Execute operation
            Note over Database: Check user permissions for resource
            Database-->>AstroAPI: Operation result
            AstroAPI-->>Browser: Success + data (200/201)
            Note over Browser: Operation completed successfully
        end
        deactivate SupabaseAuth
    end
    deactivate AstroAPI
```

## Session Management Features

- **Automatic Token Refresh**: Seamless renewal of expired tokens
- **Cookie-based Sessions**: Secure HttpOnly cookies for web pages
- **Bearer Token API**: JWT tokens for API requests
- **Middleware Protection**: Server-side route protection
- **Graceful Expiry**: Clean redirect to login on session expiry

## Security Mechanisms

- **Token Validation**: Every request validates session authenticity
- **Permission Checking**: User permissions verified for each resource
- **Secure Storage**: Session data stored securely in browser cookies
- **CSRF Protection**: Built-in protection against cross-site request forgery
