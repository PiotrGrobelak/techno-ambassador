# Technical Specification of Authentication System - Techno Ambassador

## 1. USER INTERFACE ARCHITECTURE

### 1.1 Structure of pages and components

#### 1.1.1 New authentication pages (Astro)

**Login page `src/pages/auth/login.astro`**

- Form with email and password fields
- Server-side rendering with validation error handling
- Redirect to dashboard or target page after successful login
- Integration with middleware for authentication state checking

**Registration page `src/pages/auth/register.astro`**

- Form with email, password and password confirmation fields
- Validation on both server and client side
- Automatic redirect to dashboard after registration
- Navigation link to profile page
- Create table in database for users

**Password reset page `src/pages/auth/reset-password.astro`**

- Form with single email field
- Information about sending reset link to provided address
- Error message handling for non-existing accounts

**Password update page `src/pages/auth/update-password.astro`**

- Form for setting new password after clicking email link
- Validation of reset token received from URL
- Redirect to login page after successful update

**DJ Profile `src/pages/dj/[slug].astro`**

- Main control panel page after login
- Display of basic user profile information
- Navigation to profile management and event calendar
- Required authorization through middleware

#### 1.1.2 Extension of existing pages

**Main layout `src/layouts/Layout.astro`**

- Addition of navigation component with authentication buttons in top right corner
- Conditional display of different content for logged in and logged out users
- Integration with Vue AuthNavigation component for dynamic elements

**Homepage `src/pages/index.astro`**

- Addition of "I'm a DJ" section with registration and login buttons
- Elements displayed conditionally based on authentication state
- Direct link to dashboard for authenticated DJs

#### 1.1.3 Vue components for interactivity

**Navigation component `src/shared/components/AuthNavigation.vue`**

- Interface accepting authentication state and user data
- Dynamic display of Login/Register buttons for unauthenticated users
- User menu with Logout option for logged in users
- Responsive menu adapted for mobile devices

**Universal form `src/shared/components/AuthForm.vue`**

- Working modes: login, registration, reset and password update
- Optional initial data for form pre-filling
- Real-time validation during data entry
- Handling of loading, error and success states
- Direct integration with authentication service

**Protected route component `src/shared/components/ProtectedRoute.vue`**

- Optional requirement for specific user role
- Configurable redirect URL
- Automatic redirect to login for unauthenticated users
- Display of loading state during permission checking

### 1.2 Validation logic and error handling

#### 1.2.1 Client-side validation (Vue)

- Email validation according to RFC 5322 standard, required field
- Password minimum 8 characters containing uppercase and lowercase letters and digits
- Checking password confirmation matches original password
- Real-time validation with 300ms delay

#### 1.2.2 Error message system

- Unified messages in English for all scenarios
- Error handling: required fields, invalid format, weak password
- Messages: password mismatch, login error, email taken
- Information about user not found

#### 1.2.3 Error handling scenarios

- Network errors: toast notifications with retry option
- Validation errors: inline messages directly under fields
- Authorization errors: redirect to login with context preservation
- Session timeout: automatic logout with explanatory notification

## 2. BACKEND LOGIC

### 2.1 API endpoint structure

#### 2.1.1 Authentication endpoints

**Registration endpoint `src/pages/api/auth/register.ts`**

- POST method accepting email, password and password confirmation
- Server-side input data validation
- Checking email address uniqueness in system
- Creating new account using Supabase Auth

**Login endpoint `src/pages/api/auth/login.ts`**

- POST method with login credentials email and password
- Validation of correct credentials
- User authentication through Supabase Auth
- Setting secure session cookies
- Returning user data and redirect URL

**Logout endpoint `src/pages/api/auth/logout.ts`**

- POST method to end user session
- Closing active session in Supabase system
- Removing all session-related cookies
- Returning redirect information to homepage

**Password reset endpoint `src/pages/api/auth/reset-password.ts`**

- POST method accepting only email address
- Validation of email format and existence
- Initiating password reset process through Supabase
- Sending reset link to provided email address
- Returning confirmation of message sending

**Password update endpoint `src/pages/api/auth/update-password.ts`**

- POST method with new password, confirmation and token
- Validation of reset token received from email
- Checking strength and correctness of new password
- Updating password in Supabase Auth system
- Returning operation success information

### 2.2 Data models and types

#### 2.2.1 Authentication system types

- **User**: Supabase User type with additional application fields
- **Session**: Supabase Session type with session metadata
- **AuthState**: authentication state with loading/error states
- **AuthError**: typed errors from Supabase Auth
- **AuthEvent**: authentication state change events
- **UserProfile**: combination of User with DJ profile data

### 2.3 Validation and exception handling

#### 2.3.1 Validation service

- ValidationService class with email and password validation methods
- Checking password match between each other
- Input data sanitization for security

#### 2.3.2 API error handling

- AuthErrorHandler class for processing Supabase errors
- Handling validation errors with clear messages
- Managing rate limiting errors

#### 2.3.3 Validation middleware

- validateAuthRequest function for authentication request validation
- Input sanitization before processing
- Rate limiting implementation for security

### 2.4 Server-side rendering update

#### 2.4.1 Middleware extension

- Adding authentication context to existing middleware
- Retrieving session from HTTP request
- Setting user information and session state
- Checking permissions for protected paths
- Automatic redirect to login when required

#### 2.4.2 Helper functions for Astro pages

- getAuthState for retrieving authentication state
- requireAuth for enforcing authentication
- redirectIfAuthenticated for guest-only pages
- redirectIfNotAuthenticated for protected pages

#### 2.4.3 Astro configuration update

- Enabling authentication support in environment variables
- Configuration for server-side rendering mode
- Integration with existing Vue and Tailwind plugins

## 3. AUTHENTICATION SYSTEM

### 3.1 Supabase Auth integration

#### 3.1.1 Supabase client configuration

- Creating client with automatic token refresh
- Configuration of persistent session between browser sessions
- Enabling session detection in URL for email link handling
- Using PKCE flow for enhanced security

#### 3.1.2 Authentication service

- AuthService class with registration and login methods
- Logout and password reset functions
- Email confirmation and password update methods
- Retrieving current user information
- Integration with existing user profile system
- Linking Supabase Auth accounts with DJ profiles

#### 3.1.3 Authentication state store in Pinia

- Implementation in Composition API setup syntax `authStore`
- Reactive state for user, session and loading state
- Computed properties for authentication status
- Actions for all authentication operations
- Listening to Supabase Auth events for state synchronization

### 3.2 Session management

#### 3.2.1 Session manager

- SessionManager class for handling session cookies
- Methods for setting and retrieving sessions from cookies
- Session clearing function on logout

#### 3.2.2 Automatic token refresh

- useAuthRefresh composable for listening to Supabase events
- Automatic synchronization with TOKEN_REFRESHED, SIGNED_OUT, SIGNED_IN events
- Eliminating need for manual token lifecycle management

### 3.3 Security and path protection

#### 3.3.1 Route guards

- List of protected paths requiring authentication
- Paths available only for guests (auth pages)
- Functions for checking path type
- Logic for determining target redirect URL

#### 3.3.2 API endpoint protection

- Throwing 401 Unauthorized errors for unauthenticated requests

#### 3.3.3 Path protection middleware

- Automatic redirect of logged users from auth pages
- Redirect of unauthenticated users from protected pages to login
- Preserving original path in redirectTo parameter

### 3.4 Integration with existing user system

#### 3.4.1 UserService extension

- createUserFromAuth method for creating profile with auth data
- getUserByAuthId function for finding user by auth ID
- Checking resource owner permissions
- Automatic linking of Supabase accounts with DJ profiles

#### 3.4.2 Existing API endpoints update

- Adding authentication verification to existing endpoints
- Checking owner permissions before data modification
- Integration with requireAuthForAPI functions

## 4. IMPLEMENTATION ROADMAP

### Phase 1: Basic infrastructure

1. Configuration and connection with Supabase Auth
2. Extension of existing middleware with authentication functions
3. Creation of AuthService and basic API endpoints

### Phase 2: User interface

1. Implementation of all authentication pages in Astro
2. Creation of Vue components for forms and navigation
3. Integration with Pinia store for state management

### Phase 3: Integration with existing system

1. Extension of UserService with authentication functions
2. Update of all protected API endpoints

### Phase 4: Security and UX

1. Implementation of route guards and protection middleware
2. Comprehensive error handling and edge cases

This architecture ensures full integration of the authentication system with the existing application, maintaining compatibility with all product and technical requirements of the Techno Ambassador project.
