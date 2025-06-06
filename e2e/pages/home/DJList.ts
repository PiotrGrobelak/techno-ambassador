import { type Page, type Locator, expect } from '@playwright/test';
import { DJCard } from './DJCard';

/**
 * DJList Page Object Model
 * Handles interactions with DJ results grid and list management
 */
export class DJList {
  readonly page: Page;
  readonly listContainer: Locator;
  readonly resultsGrid: Locator;
  readonly loadingSkeletons: Locator;
  readonly emptyState: Locator;
  readonly loadMoreSection: Locator;
  readonly loadMoreButton: Locator;
  readonly noMoreResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.listContainer = page.getByTestId('dj-list-container');
    this.resultsGrid = page.getByTestId('dj-results-grid');
    this.loadingSkeletons = page.getByTestId('dj-list-loading');
    this.emptyState = page.getByTestId('dj-list-empty-state');
    this.loadMoreSection = page.getByTestId('load-more-section');
    this.loadMoreButton = page.getByTestId('load-more-button');
    this.noMoreResultsMessage = page.getByTestId('no-more-results-message');
  }

  /**
   * Wait for DJ list container to be visible
   */
  async waitForListContainer(): Promise<void> {
    await expect(this.listContainer).toBeVisible();
  }

  /**
   * Check if loading skeletons are displayed
   */
  async isLoading(): Promise<boolean> {
    try {
      await expect(this.loadingSkeletons).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    // Wait for loading skeletons to disappear
    try {
      await expect(this.loadingSkeletons).toBeVisible({ timeout: 2000 });
      await expect(this.loadingSkeletons).not.toBeVisible({ timeout: 10000 });
    } catch {
      // Loading might be very fast and skeletons not visible
    }
  }

  /**
   * Get all DJ card elements
   */
  getDJCards(): Locator {
    return this.page.getByTestId('dj-card');
  }

  /**
   * Get DJ card by artist name
   */
  getDJCardByName(artistName: string): Locator {
    return this.page.getByTestId('dj-card').filter({ 
      has: this.page.getByTestId('dj-artist-name').filter({ hasText: artistName })
    });
  }

  /**
   * Get DJ card by data attribute
   */
  getDJCardByDataName(artistName: string): Locator {
    return this.page.locator(`[data-testid="dj-card"][data-dj-name="${artistName}"]`);
  }

  /**
   * Create a DJCard page object for specific DJ
   */
  getDJCard(artistName: string): DJCard {
    const cardLocator = this.getDJCardByName(artistName);
    return new DJCard(this.page, cardLocator, artistName);
  }

  /**
   * Get the number of currently displayed DJ cards
   */
  async getDisplayedDJCount(): Promise<number> {
    await this.waitForLoadingComplete();
    
    if (await this.hasResults()) {
      return await this.getDJCards().count();
    }
    return 0;
  }

  /**
   * Check if DJ results are displayed
   */
  async hasResults(): Promise<boolean> {
    try {
      await expect(this.resultsGrid).toBeVisible({ timeout: 2000 });
      const count = await this.getDJCards().count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if empty state is displayed
   */
  async hasEmptyState(): Promise<boolean> {
    try {
      await expect(this.emptyState).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify that a DJ card exists in the results
   */
  async verifyDJCardExists(artistName: string): Promise<void> {
    await this.waitForLoadingComplete();
    const djCard = this.getDJCardByName(artistName);
    await expect(djCard).toBeVisible();
    
    // Verify the artist name is displayed correctly
    const artistNameElement = djCard.getByTestId('dj-artist-name');
    await expect(artistNameElement).toHaveText(artistName);
  }

  /**
   * Verify that specific DJ cards are displayed
   */
  async verifyDJCardsDisplayed(artistNames: string[]): Promise<void> {
    await this.waitForLoadingComplete();
    
    for (const artistName of artistNames) {
      await this.verifyDJCardExists(artistName);
    }
  }

  /**
   * Get all visible DJ artist names
   */
  async getAllVisibleDJNames(): Promise<string[]> {
    await this.waitForLoadingComplete();
    
    if (!(await this.hasResults())) {
      return [];
    }
    
    const artistNameElements = this.page.getByTestId('dj-artist-name');
    const count = await artistNameElements.count();
    const names: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await artistNameElements.nth(i).textContent();
      if (name) {
        names.push(name);
      }
    }
    
    return names;
  }

  /**
   * Click on a specific DJ card to view profile
   */
  async clickDJCard(artistName: string): Promise<void> {
    const djCard = this.getDJCard(artistName);
    await djCard.clickViewProfile();
  }

  /**
   * Check if load more button is available
   */
  async hasLoadMoreButton(): Promise<boolean> {
    try {
      await expect(this.loadMoreButton).toBeVisible({ timeout: 2000 });
      return await this.loadMoreButton.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Click load more button to get additional results
   */
  async loadMoreResults(): Promise<void> {
    await expect(this.loadMoreButton).toBeVisible();
    await expect(this.loadMoreButton).toBeEnabled();
    
    const initialCount = await this.getDisplayedDJCount();
    await this.loadMoreButton.click();
    
    // Wait for new results to load
    await this.page.waitForFunction(
      (prevCount) => {
        const cards = document.querySelectorAll('[data-testid="dj-card"]');
        return cards.length > prevCount;
      },
      initialCount,
      { timeout: 10000 }
    );
  }

  /**
   * Verify empty state message
   */
  async verifyEmptyState(expectedMessage?: string): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    
    if (expectedMessage) {
      await expect(this.emptyState).toContainText(expectedMessage);
    }
  }

  /**
   * Wait for search results to update
   */
  async waitForResultsUpdate(): Promise<void> {
    // Wait a bit for any debounced search to trigger
    await this.page.waitForTimeout(500);
    await this.waitForLoadingComplete();
  }
} 