import { test, expect } from '@playwright/test';
import { NavigationComponent, LoginPage } from './pages/auth';
import { DashboardPage } from './pages/profile';

/**
 * Authentication Flow E2E Tests
 * Tests the complete login user journey using Page Object Model
 */

test.describe('Authentication Flow', () => {
  let navigation: NavigationComponent;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Object Models
    navigation = new NavigationComponent(page);
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Complete Login User Journey', async ({ page }) => {
    // Step 1: Click "Sign In" button from navigation
    await test.step('Navigate to login page', async () => {
      await navigation.verifyUnauthenticatedState();
      await navigation.clickSignIn();
    });

    // Step 2: Wait for login page to load
    await test.step('Wait for login page', async () => {
      await loginPage.waitForFormReady();
      expect(page.url()).toContain('/auth/login');
    });

    // Step 3: Fill in email and password
    await test.step('Fill login credentials', async () => {
      await loginPage.fillEmail(process.env.USER_LOGIN!);
      await loginPage.fillPassword(process.env.USER_PASSWORD!);
    });

    // Step 4: Submit the login form
    await test.step('Submit login form', async () => {
      await loginPage.submitForm();
    });

    // Step 5: Wait for dashboard to load
    await test.step('Verify successful login and dashboard access', async () => {
      await dashboardPage.waitForDashboardLoad();
      await dashboardPage.verifyDashboardAccess();
      await dashboardPage.verifyAuthenticatedState();
    });

    // Additional verification: Check navigation reflects authenticated state
    await test.step('Verify navigation shows authenticated state', async () => {
      await navigation.verifyAuthenticatedState();
    });

    await test.step('Logout from dashboard', async () => {
      await navigation.signOut();
      await navigation.verifyUnauthenticatedState();
    });
  });

  test('Login with Invalid Credentials', async ({ page }) => {
    // Navigate to login page
    await navigation.clickSignIn();
    await loginPage.waitForFormReady();

    // Attempt login with invalid credentials
    await loginPage.login('invalid@example.com', 'wrongpa20Sssword');

    // Verify error handling
    await loginPage.waitForLoginError();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid email or password');

    // Verify user stays on login page
    expect(page.url()).toContain('/auth/login');
    await loginPage.waitForFormReady();
  });

  test('Login Form Validation', async ({ page }) => {
    // Navigate to login page
    await navigation.clickSignIn();
    await loginPage.waitForFormReady();

    // Test form validation
    await loginPage.verifyFormValidation();
  });

  test('Direct Dashboard Access Without Authentication', async ({ page }) => {
    // Try to access dashboard directly without login
    await dashboardPage.goto();

    // Should be redirected to login page
    await page.waitForURL('**/auth/login**');
    expect(page.url()).toContain('/auth/login');

    // Should see authentication required message or login form
    await loginPage.waitForFormReady();
  });

  test('Navigation Between Auth Pages', async ({ page }) => {
    // Navigate to login page
    await navigation.clickSignIn();
    await loginPage.waitForFormReady();

    // Navigate to register page
    await loginPage.goToRegister();
    expect(page.url()).toContain('/auth/register');

    // Navigate back to login from register
    await page.goBack();
    expect(page.url()).toContain('/auth/login');
    await loginPage.waitForFormReady();
  });
}); 