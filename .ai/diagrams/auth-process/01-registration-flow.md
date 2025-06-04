# DJ Registration Flow

This diagram shows the complete registration process for new DJs on the Techno Ambassador platform.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser
    participant AstroAPI as Astro API
    participant SupabaseAuth as Supabase Auth
    participant Database as Database

    Note over Browser,Database: DJ Registration Process

    Browser->>AstroAPI: POST /api/auth/register
    Note over Browser,AstroAPI: {email, password, passwordConfirm}

    activate AstroAPI
    AstroAPI->>AstroAPI: Validate input data

    alt Invalid data
        AstroAPI-->>Browser: Validation errors (400)
        Note over Browser: Display validation errors
    else Valid data
        AstroAPI->>SupabaseAuth: Create account
        activate SupabaseAuth

        alt Email already exists
            SupabaseAuth-->>AstroAPI: Error: Email taken
            AstroAPI-->>Browser: Error message (409)
            Note over Browser: Show "Email already exists" message
        else Registration successful
            SupabaseAuth->>Database: Save user
            SupabaseAuth->>Browser: Send verification email
            Note over Browser: Verification email sent to user
            SupabaseAuth-->>AstroAPI: Success + session token
            AstroAPI->>AstroAPI: Set session cookies
            AstroAPI-->>Browser: Redirect to DJ profile (201)
            Note over Browser: Redirect to /dj/profile/setup
        end
        deactivate SupabaseAuth
    end
    deactivate AstroAPI
```

## Key Points

- **Validation**: Client-side and server-side validation for email format, password strength
- **Duplicate Prevention**: Checks for existing email addresses
- **Email Verification**: Automatic verification email sent after successful registration
- **Session Management**: Immediate session creation for seamless user experience
- **Error Handling**: Clear error messages for different failure scenarios
