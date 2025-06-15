# E2E Testing Guide

This directory contains end-to-end tests for the Techno Ambassador application using Playwright.

## Test Structure

### Projects Configuration

The tests are organized into multiple projects to handle different authentication states:

1. **setup** - Handles authentication setup and creates auth state file
2. **chromium-authenticated** - Runs tests that require authentication
3. **chromium-unauthenticated** - Runs authentication and registration flow tests

### Authentication Strategy

#### Authentication Setup

- The `auth.setup.ts` file handles user authentication before running authenticated tests
- It saves the authentication state to `playwright/.auth/user.json`
- This state is reused across all authenticated tests

#### Test Isolation

- Authenticated tests use the saved authentication state
- Unauthenticated tests run without any stored authentication
- Tests are isolated to prevent interference between scenarios

## Solving Authorization Issues

### Common Problems and Solutions

#### 1. **Authentication Setup Failures**

**Problem**: Authentication setup times out or fails to navigate to dashboard

**Solutions**:

- Increased timeout values in configuration
- Added multiple fallback strategies for authentication verification
- Enhanced error logging and debugging screenshots

#### 2. **Parallel Execution Race Conditions**

**Problem**: Multiple tests running simultaneously interfere with each other's authentication state

**Solutions**:

- Limited workers to 2 (from unlimited)
- Set `fullyParallel: false` for setup and unauthenticated projects
- Added retry logic with exponential backoff

#### 3. **Navigation Timeout Issues**

**Problem**: Tests fail when navigating between pages due to loading delays

**Solutions**:

- Added retry logic in NavigationComponent methods
- Implemented fallback navigation strategies
- Increased navigation and action timeouts

#### 4. **State Persistence Issues**

**Problem**: Authentication state not properly maintained between tests

**Solutions**:

- Enhanced global teardown to clean up auth files
- Added authentication state verification utilities
- Implemented browser state clearing functions

## Test Utilities

### Available Utilities (`test-utils.ts`)

- `clearBrowserState(page)` - Clears all browser storage and cookies
- `waitForPageReady(page)` - Waits for page to be fully loaded
- `retryOperation(operation)` - Retries operations with exponential backoff
- `verifyAuthState(page)` - Checks if user is authenticated
- `safeNavigate(page, url)` - Safe navigation with retry logic
- `waitForElementSafely(page, selector)` - Wait for elements with error handling

### Usage Example

```typescript
import { verifyAuthState, waitForPageReady, safeNavigate } from './test-utils';

test('example test', async ({ page }) => {
  // Verify authentication state
  const isAuthenticated = await verifyAuthState(page);

  // Safe navigation with retry
  await safeNavigate(page, '/dj/dashboard');

  // Wait for page to be ready
  await waitForPageReady(page);
});
```

## Configuration Improvements

### Timeout Settings

- **Test timeout**: 60 seconds (increased from 30)
- **Navigation timeout**: 30 seconds
- **Action timeout**: 15 seconds
- **Assertion timeout**: 10 seconds

### Worker Configuration

- **Local development**: 2 workers maximum
- **CI environment**: 1 worker (sequential execution)
- **Setup project**: Always runs sequentially

### Retry Strategy

- **Local development**: 1 retry on failure
- **CI environment**: 2 retries on failure

## Best Practices

### Test Isolation

1. Always verify authentication state in `beforeEach` hooks
2. Use test utilities for consistent behavior
3. Clean up state between test runs

### Error Handling

1. Use retry logic for flaky operations
2. Implement fallback strategies for navigation
3. Add comprehensive logging for debugging

### Performance

1. Limit parallel execution to prevent race conditions
2. Use appropriate timeouts for different operations
3. Clean up resources in teardown hooks

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run only authenticated tests
npx playwright test --project=chromium-authenticated

# Run only unauthenticated tests
npx playwright test --project=chromium-unauthenticated

# Run with debug mode
npx playwright test --debug

# Run with UI mode
npx playwright test --ui
```

## Debugging Failed Tests

### Authentication Issues

1. Check the auth setup logs in test output
2. Look for auth-setup-failure.png screenshot
3. Verify environment variables in `.env.e2e`
4. Check if authentication state file exists

### Navigation Issues

1. Review console logs for navigation attempts
2. Check current URL in error messages
3. Verify page routes exist in the application
4. Look for JavaScript errors in browser console

### Timing Issues

1. Increase timeout values if needed
2. Add wait conditions for dynamic content
3. Use `waitForPageReady()` utility
4. Check network requests in trace viewer

## Environment Variables

Required variables in `.env.e2e`:

```
USER_LOGIN=your-test-user@example.com
USER_PASSWORD=your-test-password
USER_ID=your-test-user-id
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## Troubleshooting

### Common Error Messages

**"Authentication setup failed"**

- Check credentials in `.env.e2e`
- Verify application is running
- Check for network connectivity issues

**"Test timeout exceeded"**

- Increase timeout values in configuration
- Check for slow network or application responses
- Use debug mode to identify bottlenecks

**"Element not found"**

- Verify test selectors match application elements
- Check if elements are dynamically loaded
- Use `waitForElementSafely()` utility

**"Navigation failed"**

- Check if routes exist in application
- Verify authentication requirements for routes
- Use safe navigation utilities
