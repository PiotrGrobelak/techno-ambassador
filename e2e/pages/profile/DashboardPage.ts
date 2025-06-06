import { type Page, type Locator, expect } from '@playwright/test';

/**
 * DashboardPage Page Object Model
 * Handles interactions with the DJ dashboard after successful authentication
 */
export class DashboardPage {
  readonly page: Page;
  readonly dashboardTitle: Locator;
  readonly welcomeMessage: Locator;
  readonly profileSection: Locator;
  readonly eventsSection: Locator;
  readonly statsSection: Locator;
  readonly navigationMenu: Locator;
  readonly profileButton: Locator;
  readonly eventsButton: Locator;
  readonly settingsButton: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTitle = page.getByTestId('dashboard-welcome-title');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.profileSection = page.locator('[data-testid="profile-section"]');
    this.eventsSection = page.locator('[data-testid="events-section"]');
    this.statsSection = page.locator('[data-testid="stats-section"]');
    this.navigationMenu = page.locator('[data-testid="dashboard-nav"]');
    this.profileButton = page.getByRole('button', { name: /profile/i });
    this.eventsButton = page.getByRole('button', { name: /events/i });
    this.settingsButton = page.getByRole('button', { name: /settings/i });
    this.loadingIndicator = page.locator('[data-testid="dashboard-loading"]');
  }

  /**
   * Navigate to the dashboard page
   */
  async goto(): Promise<void> {
    await this.page.goto('/dj/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for dashboard to fully load
   */
  async waitForDashboardLoad(): Promise<void> {
    // Wait for URL to be dashboard
    await this.page.waitForURL('**/dj/dashboard**');
    
    // Wait for loading to complete
    await this.page.waitForLoadState('networkidle');
    
    // Ensure loading indicator is hidden
    await expect(this.loadingIndicator).not.toBeVisible();
    
    // Wait for main dashboard elements
    await expect(this.dashboardTitle).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify dashboard is loaded and user is authenticated
   */
  async verifyDashboardAccess(): Promise<void> {
    // Check URL
    expect(this.page.url()).toContain('/dj/dashboard');
    
    // Check main dashboard elements are visible
    await expect(this.dashboardTitle).toBeVisible();
    
    // Verify no authentication errors
    const authError = this.page.locator('.auth-error');
    await expect(authError).not.toBeVisible();
  }

  /**
   * Verify welcome message is displayed for the logged-in user
   */
  async verifyWelcomeMessage(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    
    const welcomeText = await this.welcomeMessage.textContent();
    expect(welcomeText).toContain('Welcome');
  }

  /**
   * Navigate to profile section
   */
  async goToProfile(): Promise<void> {
    await expect(this.profileButton).toBeVisible();
    await this.profileButton.click();
    
    // Wait for profile section to load
    await expect(this.profileSection).toBeVisible();
  }

  /**
   * Navigate to events section
   */
  async goToEvents(): Promise<void> {
    await expect(this.eventsButton).toBeVisible();
    await this.eventsButton.click();
    
    // Wait for events section to load
    await expect(this.eventsSection).toBeVisible();
  }

  /**
   * Navigate to settings
   */
  async goToSettings(): Promise<void> {
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    
    // Wait for navigation to settings page
    await this.page.waitForURL('**/dj/settings**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if user has access to dashboard sections
   */
  async verifyDashboardSections(): Promise<void> {
    // Check that main navigation is visible
    await expect(this.navigationMenu).toBeVisible();
    
    // Check that user can access different sections
    await expect(this.profileButton).toBeVisible();
    await expect(this.eventsButton).toBeVisible();
    
    // Verify sections exist (they might be hidden until clicked)
    const profileExists = await this.profileSection.count() > 0;
    const eventsExists = await this.eventsSection.count() > 0;
    
    expect(profileExists || eventsExists).toBeTruthy();
  }

  /**
   * Get dashboard title text
   */
  async getDashboardTitle(): Promise<string> {
    await expect(this.dashboardTitle).toBeVisible();
    return await this.dashboardTitle.textContent() || '';
  }

  /**
   * Verify user authentication status on dashboard
   */
  async verifyAuthenticatedState(): Promise<void> {
    // Should be on dashboard URL
    expect(this.page.url()).toContain('/dj/dashboard');
    
    // Should not be redirected to login
    expect(this.page.url()).not.toContain('/auth/login');
    
    // Dashboard content should be visible
    await expect(this.dashboardTitle).toBeVisible();
    
    // No authentication required messages
    const authRequiredMessage = this.page.locator('text=/authentication required/i');
    await expect(authRequiredMessage).not.toBeVisible();
  }

  /**
   * Verify successful registration completion by checking dashboard access
   */
  async verifySuccessfulRegistration(): Promise<void> {
    // Wait for dashboard to load after registration
    await this.waitForDashboardLoad();
    
    // Verify we're on the dashboard
    await this.verifyDashboardAccess();
    
    // Verify welcome title is visible
    await expect(this.dashboardTitle).toBeVisible();
    await expect(this.dashboardTitle).toContainText('Welcome to Your DJ Dashboard');
  }
} 