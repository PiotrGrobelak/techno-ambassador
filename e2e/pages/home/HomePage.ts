import { type Page, type Locator, expect } from '@playwright/test';

/**
 * HomePage Page Object Model
 * Handles interactions with the homepage hero section and navigation to search
 */
export class HomePage {
  readonly page: Page;
  readonly heroSection: Locator;
  readonly startExploringButton: Locator;
  readonly browseEventsButton: Locator;
  readonly mainTitle: Locator;
  readonly subtitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroSection = page.locator('section').first();
    this.startExploringButton = page.getByTestId('start-exploring-button');
    this.browseEventsButton = page.getByRole('link', { name: 'Browse Events' });
    this.mainTitle = page.getByRole('heading', { name: 'Techno Ambassador' });
    this.subtitle = page.getByText('Discover electronic music DJs and explore the world of techno');
  }

  /**
   * Navigate to the homepage
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Wait for the hero section to be visible
   */
  async waitForHeroSection(): Promise<void> {
    await expect(this.heroSection).toBeVisible();
    await expect(this.mainTitle).toBeVisible();
    await expect(this.subtitle).toBeVisible();
  }

  /**
   * Click the "Start Exploring" button and wait for navigation to search section
   */
  async clickStartExploring(): Promise<void> {
    await expect(this.startExploringButton).toBeVisible();
    await expect(this.startExploringButton).toBeEnabled();
    
    // Click and wait for scroll to search section
    await this.startExploringButton.click();
    
    // Wait for the search section to be visible (scroll complete)
    await this.page.waitForSelector('[data-testid="dj-search-widget"]', { 
      state: 'visible' 
    });
  }

  /**
   * Verify that hero section is displayed correctly
   */
  async verifyHeroContent(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.mainTitle).toHaveText('Techno Ambassador');
    await expect(this.subtitle).toContainText('Discover electronic music DJs');
    await expect(this.startExploringButton).toHaveText('Start Exploring');
    await expect(this.browseEventsButton).toHaveText('Browse Events');
  }

  /**
   * Check if the page has loaded completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForHeroSection();
  }
} 