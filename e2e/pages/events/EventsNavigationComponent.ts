import { type Page, type Locator, expect } from '@playwright/test';

/**
 * EventsNavigationComponent Page Object Model
 * Handles navigation to Events Management and related pages
 */
export class EventsNavigationComponent {
  readonly page: Page;
  readonly eventsButton: Locator;
  readonly mobileEventsButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly dashboardButton: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventsButton = page.getByTestId('events-button');
    this.mobileEventsButton = page.getByTestId('mobile-events-button');
    this.mobileMenuButton = page.getByTestId('mobile-menu-button');
    this.dashboardButton = page.getByTestId('dashboard-button');
    this.userMenu = page.getByTestId('user-menu');
  }

  /**
   * Navigate to Events Management page (desktop)
   */
  async goToEventsManagement(): Promise<void> {
    await expect(this.eventsButton).toBeVisible();
    await expect(this.eventsButton).toBeEnabled();
    
    await this.eventsButton.click();
    
    // Wait for navigation to events management page
    await this.page.waitForURL('**/dj/events**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Events Management page (mobile)
   */
  async goToEventsManagementMobile(): Promise<void> {
    // First open mobile menu
    await expect(this.mobileMenuButton).toBeVisible();
    await this.mobileMenuButton.click();
    
    // Wait for mobile menu to appear
    await expect(this.userMenu).toBeVisible();
    
    // Click events button in mobile menu
    await expect(this.mobileEventsButton).toBeVisible();
    await expect(this.mobileEventsButton).toBeEnabled();
    
    await this.mobileEventsButton.click();
    
    // Wait for navigation to events management page
    await this.page.waitForURL('**/dj/events**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Dashboard
   */
  async goToDashboard(): Promise<void> {
    await expect(this.dashboardButton).toBeVisible();
    await expect(this.dashboardButton).toBeEnabled();
    
    await this.dashboardButton.click();
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('**/dj/dashboard**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify that events navigation is available (user is authenticated)
   */
  async verifyEventsNavigationAvailable(): Promise<void> {
    await expect(this.eventsButton).toBeVisible();
    await expect(this.dashboardButton).toBeVisible();
  }

  /**
   * Check if we're currently on the events management page
   */
  async isOnEventsManagementPage(): Promise<boolean> {
    return this.page.url().includes('/dj/events');
  }
} 