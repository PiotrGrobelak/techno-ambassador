# Logout Flow

This diagram shows the process of securely logging out a user and cleaning up their session.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser
    participant AstroAPI as Astro API
    participant SupabaseAuth as Supabase Auth
    participant Database as Database

    Note over Browser,Database: Logout Process

    Browser->>AstroAPI: POST /api/auth/logout
    Note over Browser,AstroAPI: Request initiated from logout button

    activate AstroAPI
    AstroAPI->>AstroAPI: Check current session

    alt No active session
        AstroAPI-->>Browser: Redirect to homepage (302)
        Note over Browser: Already logged out
    else Session active
        AstroAPI->>SupabaseAuth: End user session
        activate SupabaseAuth

        SupabaseAuth->>SupabaseAuth: Invalidate session token
        Note over SupabaseAuth: Invalidate JWT token on server

        SupabaseAuth->>Database: Remove session entry (optional)
        Note over Database: Clean up session records if stored

        SupabaseAuth-->>AstroAPI: Session ended successfully
        deactivate SupabaseAuth

        AstroAPI->>AstroAPI: Remove session cookies
        Note over AstroAPI: Clear httpOnly cookies

        AstroAPI->>AstroAPI: Clear user cache data
        Note over AstroAPI: Clear any server-side cached user data

        AstroAPI-->>Browser: Redirect to homepage (302)
        Note over Browser: Redirect to homepage with logout success message
    end
    deactivate AstroAPI

    Note over Browser,Database: Post-logout Status Check

    Browser->>AstroAPI: GET /dj/dashboard (test access)
    Note over Browser,AstroAPI: User tries to access protected route

    activate AstroAPI
    AstroAPI->>AstroAPI: Check session
    AstroAPI-->>Browser: Redirect to login (302)
    Note over Browser: Confirmed logout - access denied
    deactivate AstroAPI
```

## Logout Security Features

- **Complete Session Cleanup**: Removes all traces of user session
- **Server-side Invalidation**: Tokens invalidated on Supabase Auth server
- **Cookie Removal**: All authentication cookies cleared from browser
- **Cache Cleanup**: Server-side user data cache cleared
- **Redirect Protection**: Automatic redirect to safe public page

## Client-side Cleanup

After successful logout, the client should also:

- Clear any user data from localStorage/sessionStorage
- Reset application state (Pinia stores)
- Clear any cached API responses
- Reset form states and user preferences

## Security Considerations

- **CSRF Protection**: Logout endpoint protected against cross-site attacks
- **Token Blacklisting**: Invalidated tokens cannot be reused
- **Session Fixation Prevention**: New session required for next login
- **Audit Logging**: Logout events logged for security monitoring
