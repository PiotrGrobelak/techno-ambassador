# Password Reset Flow

This diagram shows the complete password reset process for users who have forgotten their passwords.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser
    participant AstroAPI as Astro API
    participant SupabaseAuth as Supabase Auth
    participant Database as Database
    participant EmailService as Email Service

    Note over Browser,EmailService: Password Reset Request

    Browser->>AstroAPI: POST /api/auth/reset-password
    Note over Browser,AstroAPI: {email}

    activate AstroAPI
    AstroAPI->>AstroAPI: Validate email format

    alt Invalid email
        AstroAPI-->>Browser: Validation error (400)
        Note over Browser: Show email format error
    else Valid email
        AstroAPI->>SupabaseAuth: Send reset link
        activate SupabaseAuth

        SupabaseAuth->>Database: Check if email exists

        alt Email doesn't exist
            Database-->>SupabaseAuth: User not found
            Note over SupabaseAuth: Security: Always return success
            SupabaseAuth-->>AstroAPI: Success (for security)
        else Email exists
            Database-->>SupabaseAuth: User found
            SupabaseAuth->>EmailService: Send email with reset token
            EmailService->>Browser: Email with reset link
            Note over Browser: Reset link sent to user's email
            SupabaseAuth-->>AstroAPI: Send confirmation
        end

        deactivate SupabaseAuth
        AstroAPI-->>Browser: Email sent message (200)
        Note over Browser: "Check your email for reset instructions"
    end
    deactivate AstroAPI

    Note over Browser,EmailService: Password Update

    Browser->>AstroAPI: GET /auth/update-password?token=abc123
    Note over Browser,AstroAPI: User clicks email link

    activate AstroAPI
    AstroAPI->>SupabaseAuth: Verify reset token
    activate SupabaseAuth

    alt Invalid/expired token
        SupabaseAuth-->>AstroAPI: Token error
        AstroAPI-->>Browser: Redirect with error (302)
        Note over Browser: "Reset link expired or invalid"
    else Valid token
        SupabaseAuth-->>AstroAPI: Token OK
        AstroAPI-->>Browser: Render new password form (200)
        Note over Browser: Show password update form
    end
    deactivate SupabaseAuth
    deactivate AstroAPI

    Browser->>AstroAPI: POST /api/auth/update-password
    Note over Browser,AstroAPI: {token, newPassword, confirmPassword}

    activate AstroAPI
    AstroAPI->>AstroAPI: Validate new password

    alt Password too weak
        AstroAPI-->>Browser: Validation errors (400)
        Note over Browser: Show password requirements
    else Valid password
        AstroAPI->>SupabaseAuth: Update password
        activate SupabaseAuth

        alt Invalid token
            SupabaseAuth-->>AstroAPI: Token error (401)
            AstroAPI-->>Browser: Error message
            Note over Browser: "Reset session expired"
        else Update successful
            SupabaseAuth->>Database: Save new password (hash)
            Note over Database: Store bcrypt hashed password
            SupabaseAuth-->>AstroAPI: Success
            AstroAPI-->>Browser: Redirect to login (302)
            Note over Browser: "Password updated successfully"
        end
        deactivate SupabaseAuth
    end
    deactivate AstroAPI
```

## Security Features

- **Email Verification**: Reset links sent only to verified email addresses
- **Token Expiration**: Reset tokens expire after 1 hour for security
- **Rate Limiting**: Prevents spam reset requests from same IP/email
- **Secure Responses**: Always returns success even for non-existent emails
- **Password Validation**: Enforces strong password requirements

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
