import { type Page, type Locator, expect } from '@playwright/test';

/**
 * NavigationComponent Page Object Model
 * Handles interactions with the main navigation, specifically authentication-related actions
 */
export class NavigationComponent {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly djButton: Locator;
  readonly userMenu: Locator;
  readonly dashboardButton: Locator;
  readonly signOutButton: Locator;
  readonly eventsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByTestId('nav-sign-in-button');
    this.djButton = page.getByTestId('nav-dj-register-button');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.dashboardButton = page.getByTestId('nav-dashboard-button');
    this.signOutButton = page.getByTestId('nav-sign-out-button');
    this.eventsButton = page.getByTestId('nav-events-button');
  }

  /**
   * Click the Sign In button and wait for navigation to login page
   */
  async clickSignIn(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
    await expect(this.signInButton).toBeEnabled();
    
    // Click Sign In button
    await this.signInButton.click();
    
    // Wait for navigation to login page
    await this.page.waitForURL('**/auth/login**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click the "I'm a DJ" button and wait for navigation to register page
   */
  async clickDJButton(): Promise<void> {
    await expect(this.djButton).toBeVisible();
    await expect(this.djButton).toBeEnabled();
    
    await this.djButton.click();
    
    // Wait for navigation to register page
    await this.page.waitForURL('**/auth/register**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click the Dashboard button (for authenticated users)
   */
  async clickDashboard(): Promise<void> {
    await expect(this.dashboardButton).toBeVisible();
    await expect(this.dashboardButton).toBeEnabled();
    
    await this.dashboardButton.click();
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('**/dj/dashboard**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click the Events button and wait for navigation to events management page
   */
  async clickEventsManagement(): Promise<void> {
    await expect(this.eventsButton).toBeVisible();
    await expect(this.eventsButton).toBeEnabled();
    
    await this.eventsButton.click();
    
    // Wait for navigation to events management page
    await this.page.waitForURL('**/dj/events**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    await expect(this.signOutButton).toBeVisible();
    await expect(this.signOutButton).toBeEnabled();
    
    await this.signOutButton.click();
    
    // Wait for sign out to complete and redirect
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify that navigation is in unauthenticated state
   */
  async verifyUnauthenticatedState(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
    await expect(this.djButton).toBeVisible();
    await expect(this.userMenu).not.toBeVisible();
  }

  /**
   * Verify that navigation is in authenticated state
   */
  async verifyAuthenticatedState(): Promise<void> {
    await expect(this.signInButton).not.toBeVisible();
    await expect(this.djButton).not.toBeVisible();
    await expect(this.dashboardButton).toBeVisible();
    await expect(this.signOutButton).toBeVisible();
  }
} 