# DJ Login Flow

This diagram shows the authentication process for existing DJs logging into their accounts.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser
    participant AstroAPI as Astro API
    participant SupabaseAuth as Supabase Auth
    participant Database as Database

    Note over Browser,Database: Login Process

    Browser->>AstroAPI: POST /api/auth/login
    Note over Browser,AstroAPI: {email, password}

    activate AstroAPI
    AstroAPI->>SupabaseAuth: Authenticate user
    activate SupabaseAuth

    alt Invalid credentials
        SupabaseAuth-->>AstroAPI: Authentication error (401)
        AstroAPI-->>Browser: Error message
        Note over Browser: Show "Invalid credentials" message
    else Login successful
        SupabaseAuth->>Database: Check user
        Note over Database: Verify user exists and is active
        SupabaseAuth-->>AstroAPI: Session token + user data
        AstroAPI->>AstroAPI: Set session cookies
        Note over AstroAPI: Set httpOnly cookies for security
        AstroAPI-->>Browser: Redirect to DJ panel (200)
        Note over Browser: Redirect to /dj/dashboard
    end
    deactivate SupabaseAuth
    deactivate AstroAPI

    Note over Browser,Database: Profile Completeness Check

    Browser->>AstroAPI: GET /api/user/profile
    activate AstroAPI
    AstroAPI->>Database: Get profile data
    Database-->>AstroAPI: User profile data

    alt Incomplete profile
        AstroAPI-->>Browser: Redirect to profile completion
        Note over Browser: Redirect to /dj/profile/setup
    else Complete profile
        AstroAPI-->>Browser: Continue to dashboard
        Note over Browser: Stay on /dj/dashboard
    end
    deactivate AstroAPI
```

## Key Points

- **Credential Validation**: Secure password verification through Supabase Auth
- **Session Creation**: HttpOnly cookies for enhanced security
- **Profile Check**: Ensures user profile is complete before accessing dashboard
- **Error Handling**: Clear feedback for invalid login attempts
- **Automatic Redirect**: Smart routing based on profile completion status

## Security Features

- **HttpOnly Cookies**: Prevents XSS attacks on session tokens
- **Secure Transmission**: All authentication data sent over HTTPS
- **Rate Limiting**: Built-in protection against brute force attacks
- **Session Expiry**: Automatic token refresh and expiration handling
