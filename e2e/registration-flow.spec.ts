import { test, expect } from '@playwright/test';
import { NavigationComponent } from './pages/shared/NavigationComponent';
import { DashboardPage } from './pages/profile/DashboardPage';
import { RegisterPage } from './pages/auth/RegisterPage';

test.describe('DJ Registration Flow', () => {
  let registerPage: RegisterPage;
  let navigation: NavigationComponent;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Object Models
    registerPage = new RegisterPage(page);
    navigation = new NavigationComponent(page);
    dashboardPage = new DashboardPage(page);

    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test.skip('should complete DJ Registration User Journey', async ({ page }) => {

    // Step 1: Click "I'm a DJ" button
    await navigation.clickDJButton();

    // Step 2: Verify navigation to registration page and wait for form ready
    expect(page.url()).toContain('/auth/register');
    await registerPage.waitForFormReady();

    // Step 3: Fill registration form
    await registerPage.fillEmail(process.env.USER_LOGIN!);
    await registerPage.fillPassword(process.env.USER_PASSWORD!);
    await registerPage.fillPasswordConfirmation(process.env.USER_PASSWORD!);

    // Step 4: Submit form
    await registerPage.submitForm();

    // Step 5: Wait for dashboard redirect
    await registerPage.waitForSuccessfulRegistration();

    // Step 6: Verify successful registration
    expect(page.url()).toContain('/dj/dashboard');
    await dashboardPage.waitForDashboardLoad();
    
    // Verify dashboard welcome message
    await expect(page.getByTestId('dashboard-welcome-title')).toContainText('Welcome to Your DJ Dashboard');
  });

  test('should disable submit button when passwords do not match', async () => {
    // Navigate to registration page
    await navigation.clickDJButton();
    await registerPage.waitForFormReady();

    // Test form validation
    await registerPage.verifyFormValidation();
  });

  test('should show error message when password is too weak', async () => {
    const invalidEmail = 'invalid@email.com';
    const weakPassword = '123ds';

    // Navigate to registration page
    await navigation.clickDJButton();
    await registerPage.waitForFormReady();
    
    // Fill invalid credentials
    await registerPage.fillEmail(invalidEmail);
    await registerPage.fillPassword(weakPassword);
    await registerPage.fillPasswordConfirmation(weakPassword);

    // Wait for error and verify error message
    await registerPage.waitForRegistrationError();
    const errorMessage = await registerPage.getErrorMessage();
    
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.toLowerCase()).toContain('must be at least 8 characters');
  });

  test('should navigate to login page from registration page', async () => {
    // Start registration process
    await navigation.clickDJButton();
    await registerPage.waitForFormReady();

    // Navigate to login from registration
    await registerPage.goToLogin();
    
    // Verify we're on login page
    expect(registerPage.page.url()).toContain('/auth/login');

    
  });
});
