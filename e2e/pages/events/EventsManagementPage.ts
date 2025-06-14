import { type Page, type Locator, expect } from '@playwright/test';

/**
 * EventsManagementPage Page Object Model
 * Handles interactions with the main Events Management page
 */
export class EventsManagementPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly addEventButton: Locator;
  readonly upcomingEventsCount: Locator;
  readonly pastEventsCount: Locator;
  readonly totalEventsCount: Locator;
  readonly eventsSection: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1', { hasText: 'Events Management' });
    this.pageDescription = page.locator('p', { hasText: 'Manage your upcoming and past techno events' });
    this.addEventButton = page.getByTestId('add-event-button');
    this.upcomingEventsCount = page.locator('.stats-cards').locator('text=Upcoming Events').locator('..').locator('.text-2xl');
    this.pastEventsCount = page.locator('.stats-cards').locator('text=Past Events').locator('..').locator('.text-2xl');
    this.totalEventsCount = page.locator('.stats-cards').locator('text=Total Events').locator('..').locator('.text-2xl');
    this.eventsSection = page.locator('.events-section');
    this.loadingSpinner = page.locator('.animate-spin');
  }

  /**
   * Navigate to the Events Management page
   */
  async goto(): Promise<void> {
    await this.page.goto('/dj/events');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageDescription).toBeVisible();
    
    // Wait for loading to complete
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Click the Add Event button to open the form
   */
  async clickAddEvent(): Promise<void> {
    await expect(this.addEventButton).toBeVisible();
    await expect(this.addEventButton).toBeEnabled();
    
    await this.addEventButton.click();
    
    // Wait for form to appear
    await this.page.waitForSelector('[data-testid="add-event-form"]', { state: 'visible' });
  }

  /**
   * Verify the page is loaded and ready for interaction
   */
  async verifyPageReady(): Promise<void> {
    await this.waitForPageLoad();
    await expect(this.addEventButton).toBeVisible();
    await expect(this.eventsSection).toBeVisible();
  }

  /**
   * Get the current stats from the dashboard cards
   */
  async getEventStats(): Promise<{
    upcoming: number;
    past: number;
    total: number;
  }> {
    await this.waitForPageLoad();
    
    const upcomingText = await this.upcomingEventsCount.textContent() || '0';
    const pastText = await this.pastEventsCount.textContent() || '0';
    const totalText = await this.totalEventsCount.textContent() || '0';
    
    return {
      upcoming: parseInt(upcomingText, 10),
      past: parseInt(pastText, 10),
      total: parseInt(totalText, 10),
    };
  }

  /**
   * Verify that the Add Event button is visible and enabled
   */
  async verifyAddEventButtonAvailable(): Promise<void> {
    await expect(this.addEventButton).toBeVisible();
    await expect(this.addEventButton).toBeEnabled();
  }

  /**
   * Check if the Add Event form is currently visible
   */
  async isAddEventFormVisible(): Promise<boolean> {
    try {
      await expect(this.page.getByTestId('add-event-form')).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the page is in empty state (no events)
   */
  async isEmptyState(): Promise<boolean> {
    try {
      await expect(this.page.getByTestId('empty-state-add-event')).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for events to load and display
   */
  async waitForEventsToLoad(): Promise<void> {
    // Wait for loading to complete
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
    
    // Wait for either events list or empty state
    await Promise.race([
      this.page.getByTestId('events-dataview').waitFor({ state: 'visible' }),
      this.page.getByTestId('empty-state-add-event').waitFor({ state: 'visible' })
    ]);
  }
} 