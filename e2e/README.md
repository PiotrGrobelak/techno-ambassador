# E2E Testing with Authentication Setup

This directory contains end-to-end tests for the Techno Ambassador application with pre-configured authentication setup.

## Authentication Setup

The authentication setup allows tests to run with a pre-authenticated user, eliminating the need to log in for every test that requires authentication.

### How it works

1. **Setup Project** (`auth.setup.ts`): Runs before all tests to authenticate a user and save the authentication state
2. **Authenticated Tests**: Use the saved authentication state to run tests as an authenticated user
3. **Unauthenticated Tests**: Run without authentication for testing login/registration flows

### Configuration

The authentication setup is configured in `playwright.config.ts` with three projects:

- `setup`: Runs the authentication setup
- `chromium-authenticated`: Runs tests that require authentication
- `chromium-unauthenticated`: Runs tests that should not be authenticated (auth/registration flows)

### Environment Variables

Authentication credentials are stored in `.env.e2e`:

```env
USER_LOGIN=your-test-user@example.com
USER_PASSWORD=your-test-password
```

### File Structure

```
e2e/
├── auth.setup.ts              # Authentication setup script
├── authenticated-example.spec.ts  # Example authenticated tests
├── auth-flow.spec.ts          # Unauthenticated auth flow tests
├── registration-flow.spec.ts  # Unauthenticated registration tests
├── pages/                     # Page Object Models
└── playwright/.auth/          # Stored authentication state (gitignored)
    └── user.json             # Saved authentication state
```

### Running Tests

```bash
# Run all tests (setup will run automatically)
npm run test:e2e

# Run only authenticated tests
npx playwright test --project=chromium-authenticated

# Run only unauthenticated tests
npx playwright test --project=chromium-unauthenticated

# Run setup only
npx playwright test --project=setup
```

### Writing Authenticated Tests

When writing tests that require authentication, they will automatically use the pre-authenticated state:

```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/profile';

test.describe('My Authenticated Feature', () => {
  test('should access protected feature', async ({ page }) => {
    // User is already authenticated - no need to login
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Test your authenticated functionality
    await dashboardPage.verifyDashboardAccess();
  });
});
```

### Writing Unauthenticated Tests

For tests that should run without authentication (like login/registration flows), add them to the `testMatch` array in the `chromium-unauthenticated` project configuration.

### Troubleshooting

1. **Authentication fails**: Check that `USER_LOGIN` and `USER_PASSWORD` in `.env.e2e` are correct
2. **Tests fail with authentication errors**: Ensure the authentication state file exists in `playwright/.auth/user.json`
3. **Setup doesn't run**: Make sure the setup project is configured correctly in `playwright.config.ts`

### Security Notes

- The `playwright/.auth/` directory is gitignored to prevent committing authentication tokens
- Use test-specific credentials, not production credentials
- Regularly rotate test user passwords
