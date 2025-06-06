import { test, expect } from '@playwright/test';
import { RegisterPage, NavigationComponent } from './pages/auth';
import { DashboardPage } from './pages/profile/DashboardPage';

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

  test('Complete DJ Registration User Journey', async ({ page }) => {

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
    await dashboardPage.verifySuccessfulRegistration();
    
    // Verify dashboard welcome message
    await expect(page.getByTestId('dashboard-welcome-title')).toContainText('Welcome to Your DJ Dashboard');
  });

  test('DJ Registration Form Validation', async () => {
    // Navigate to registration page
    await navigation.clickDJButton();
    await registerPage.waitForFormReady();

    // Test form validation
    await registerPage.verifyFormValidation();
  });

  test('Registration Error Handling', async () => {
    const invalidEmail = 'invalid-email';
    const weakPassword = '123ds';

    // Navigate to registration page
    await navigation.clickDJButton();
    await registerPage.waitForFormReady();
    
    // Fill invalid credentials
    await registerPage.fillEmail(invalidEmail);
    await registerPage.fillPassword(weakPassword);
    await registerPage.fillPasswordConfirmation(weakPassword);
    await registerPage.submitForm();

    // Wait for error and verify error message
    await registerPage.waitForRegistrationError();
    const errorMessage = await registerPage.getErrorMessage();
    
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.toLowerCase()).toContain('email');
  });

  test('Navigation Between Authentication Pages', async () => {
    // Start registration process
    await navigation.clickDJButton();
    await registerPage.waitForFormReady();

    // Navigate to login from registration
    await registerPage.goToLogin();
    
    // Verify we're on login page
    expect(registerPage.page.url()).toContain('/auth/login');

    
  });
});
