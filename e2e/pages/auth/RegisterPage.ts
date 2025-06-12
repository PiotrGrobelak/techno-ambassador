import { type Page, type Locator, expect } from '@playwright/test';

/**
 * RegisterPage Page Object Model
 * Handles interactions with the registration form and DJ signup flow
 */
export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmationInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loginLink: Locator;
  readonly homeLink: Locator;
  readonly loadingSpinner: Locator;
  readonly passwordOverlay: Locator;
  readonly termsLink: Locator;
  readonly privacyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="auth-email-input"]');
    this.passwordInput = page.locator('[data-testid="auth-password-input"] input');
    this.passwordConfirmationInput = page.locator('[data-testid="auth-password-confirmation-input"] input');
    this.submitButton = page.getByTestId('auth-submit-button');
    this.errorMessage = page.locator('.text-red-600');
    this.successMessage = page.locator('.text-green-600');
    this.loginLink = page.getByTestId('register-to-login-link');
    this.homeLink = page.getByRole('link', { name: '← Back to home' });
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.passwordOverlay = page.locator('.p-password-overlay');
    this.termsLink = page.getByRole('link', { name: 'Terms of Service' });
    this.privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
  }

  /**
   * Navigate to the registration page
   */
  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
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

    // Click outside to trigger validation
    await this.page.locator('body').click();
    // Wait for any password overlay to disappear
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

    // Click outside to trigger validation
    await this.page.locator('body').click();
    // Wait for any password overlay to disappear
    await expect(this.passwordOverlay).not.toBeVisible();
  }

  /**
   * Fill in the password confirmation field
   */
  async fillPasswordConfirmation(password: string): Promise<void> {
    await expect(this.passwordConfirmationInput).toBeVisible();
    await expect(this.passwordConfirmationInput).toBeEnabled();
    
    await this.passwordConfirmationInput.clear();
    await this.passwordConfirmationInput.fill(password);

    // Click outside to trigger validation
    await this.page.locator('body').click();
    // Wait for any password overlay to disappear
    await expect(this.passwordOverlay).not.toBeVisible();
  }

  /**
   * Click the submit button to create account
   */
  async submitForm(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
    
    // Click submit button
    await this.submitButton.click();
  }

  /**
   * Complete registration flow with email and password
   */
  async register(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillPasswordConfirmation(password);
    await this.submitForm();
  }

  /**
   * Wait for successful registration and redirect to dashboard
   */
  async waitForSuccessfulRegistration(): Promise<void> {
    // Wait for either success message or navigation to dashboard
    await Promise.race([
      this.page.waitForURL('**/dj/dashboard**', { timeout: 15000 }),
      this.successMessage.waitFor({ state: 'visible', timeout: 15000 })
    ]);
    
    // If redirected to dashboard, wait for it to load
    if (this.page.url().includes('/dj/dashboard')) {
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Wait for registration error to appear
   */
  async waitForRegistrationError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify form validation states for registration
   */
  async verifyFormValidation(): Promise<void> {
    // Check that submit button is disabled when form is empty
    await expect(this.submitButton).toBeDisabled();
    
    // Fill invalid email
    await this.fillEmail('invalid-email');
    await expect(this.submitButton).toBeDisabled();
    
    // Fill valid email but no password
    await this.fillEmail('test@example.com');
    await expect(this.submitButton).toBeDisabled();
    
    // Fill password but no confirmation
    await this.fillPassword('ValidPass123');
    await expect(this.submitButton).toBeDisabled();
    
    // Fill mismatched password confirmation
    await this.fillPasswordConfirmation('DifferentPass123');
    await expect(this.submitButton).toBeDisabled();
    
    // Fill matching password confirmation
    await this.fillPasswordConfirmation('ValidPass123');
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Check if the registration form is visible and ready for interaction
   */
  async waitForFormReady(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordConfirmationInput).toBeVisible();
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
   * Navigate to login page from registration
   */
  async goToLogin(): Promise<void> {
    await expect(this.loginLink).toBeVisible();
    await this.loginLink.click();
    
    await this.page.waitForURL('**/auth/login**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate back to home page
   */
  async goToHome(): Promise<void> {
    await expect(this.homeLink).toBeVisible();
    await this.homeLink.click();
    
    await this.page.waitForURL('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify registration page content
   */
  async verifyPageContent(): Promise<void> {
    // Check page title/heading
    const pageTitle = this.page.locator('h1');
    await expect(pageTitle).toContainText('Join the Community');
    
    // Check form fields are present
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordConfirmationInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    
    // Check submit button has correct text
    await expect(this.submitButton).toContainText('Create Account');
    
    // Check navigation links
    await expect(this.loginLink).toBeVisible();
    await expect(this.homeLink).toBeVisible();
  }

  /**
   * Verify terms and privacy links are present
   */
  async verifyLegalLinks(): Promise<void> {
    await expect(this.termsLink).toBeVisible();
    await expect(this.privacyLink).toBeVisible();
  }
} 