import { type Page, type Locator, expect } from '@playwright/test';

/**
 * LoginPage Page Object Model
 * Handles interactions with the login form and authentication flow
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loadingSpinner: Locator;
  readonly passwordOverlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="auth-email-input"] input');
    this.passwordInput = page.locator('[data-testid="auth-password-input"] input');
    this.submitButton = page.getByTestId('auth-submit-button');
    this.errorMessage = page.locator('.bg-red-50');
    this.successMessage = page.locator('.bg-green-50');
    this.registerLink = page.getByRole('link', { name: 'Create one here' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password' });
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.passwordOverlay = page.locator('.p-password-overlay');
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill in the email field
   */
  async fillEmail(email: string): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeEnabled();
    
    await this.emailInput.clear();
    await this.emailInput.fill(email);


    await this.page.locator('body').click();
    // Wait for password overlay to disappear
    await expect(this.passwordOverlay).not.toBeVisible();
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string): Promise<void> {
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toBeEnabled();
    
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);

    await this.page.locator('body').click();
    // Wait for password overlay to disappear
    await expect(this.passwordOverlay).not.toBeVisible();
  }

  /**
   * Click the submit button and handle the login process
   */
  async submitForm(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
    
    // Click submit button
    await this.submitButton.click();
  }

  /**
   * Complete login flow with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitForm();
  }

  /**
   * Wait for successful login and redirect to dashboard
   */
  async waitForSuccessfulLogin(): Promise<void> {
    // Wait for either success message or navigation to dashboard
    await Promise.race([
      this.page.waitForURL('**/dj/dashboard**', { timeout: 10000 }),
      this.successMessage.waitFor({ state: 'visible', timeout: 10000 })
    ]);
    
    // If redirected, wait for dashboard to load
    if (this.page.url().includes('/dj/dashboard')) {
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Wait for login error to appear
   */
  async waitForLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify form validation states
   */
  async verifyFormValidation(): Promise<void> {
    // Check that submit button is disabled when form is empty
    await expect(this.submitButton).toBeDisabled();
    
    // Fill invalid email
    await this.fillEmail('invalid-email');
    await expect(this.submitButton).toBeDisabled();
    
    // Fill valid email but no password
    await this.fillEmail(process.env.USER_LOGIN!);
    await expect(this.submitButton).toBeDisabled();
    
    // Fill valid email and password
    await this.fillPassword(process.env.USER_PASSWORD!);
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Check if the login form is visible and ready for interaction
   */
  async waitForFormReady(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    
    // Ensure form is not in loading state
    await expect(this.loadingSpinner).not.toBeVisible();
  }

  /**
   * Get the current error message text
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Get the current success message text
   */
  async getSuccessMessage(): Promise<string> {
    await expect(this.successMessage).toBeVisible();
    return await this.successMessage.textContent() || '';
  }

  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await expect(this.registerLink).toBeVisible();
    await this.registerLink.click();
    
    await this.page.waitForURL('**/auth/register**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<void> {
    await expect(this.forgotPasswordLink).toBeVisible();
    await this.forgotPasswordLink.click();
    
    await this.page.waitForURL('**/auth/reset-password**');
    await this.page.waitForLoadState('domcontentloaded');
  }
} 