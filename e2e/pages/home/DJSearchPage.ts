import { type Page, type Locator, expect } from '@playwright/test';
import { SearchFilters } from './SearchFilters';
import { DJList } from './DJList';

/**
 * DJSearchPage Page Object Model
 * Handles the main DJ search widget and coordinates search functionality
 */
export class DJSearchPage {
  readonly page: Page;
  readonly searchWidget: Locator;
  readonly resultsSection: Locator;
  readonly loadingIndicator: Locator;
  readonly errorSection: Locator;
  readonly retryButton: Locator;
  
  // Component page objects
  readonly searchFilters: SearchFilters;
  readonly djList: DJList;

  constructor(page: Page) {
    this.page = page;
    this.searchWidget = page.getByTestId('dj-search-widget');
    this.resultsSection = page.getByTestId('search-results-summary');
    this.loadingIndicator = page.locator('.animate-spin');
    this.errorSection = page.locator('.bg-red-50');
    this.retryButton = page.getByRole('button', { name: 'Try again' });
    
    // Initialize component page objects
    this.searchFilters = new SearchFilters(page);
    this.djList = new DJList(page);
  }

  /**
   * Wait for the search section to be visible after navigation
   */
  async waitForSearchSection(): Promise<void> {
    await expect(this.searchWidget).toBeVisible();
  }

  /**
   * Wait for the search widget to be fully loaded and ready
   */
  async waitForSearchWidgetReady(): Promise<void> {
    await this.waitForSearchSection();
    await this.searchFilters.waitForFiltersReady();
    
    // Wait for initial data loading to complete
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid="dj-list-loading"]');
      return loadingElements.length === 0;
    }, { timeout: 10000 });
  }

  /**
   * Get the current results summary text
   */
  async getResultsSummary(): Promise<string> {
    await expect(this.resultsSection).toBeVisible();
    return await this.resultsSection.textContent() || '';
  }

  /**
   * Check if search results are displayed
   */
  async hasSearchResults(): Promise<boolean> {
    try {
      await expect(this.resultsSection).toBeVisible({ timeout: 5000 });
      const summary = await this.getResultsSummary();
      return summary.includes('Showing') && !summary.includes('No DJs found');
    } catch {
      return false;
    }
  }

  /**
   * Wait for search results to update after a search query
   */
  async waitForSearchResults(): Promise<void> {
    // Wait for any loading state to finish
    try {
      await expect(this.loadingIndicator).toBeVisible({ timeout: 2000 });
      await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 });
    } catch {
      // Loading indicator might not appear for fast searches
    }
    
    // Ensure results section is visible
    await expect(this.resultsSection).toBeVisible();
  }

  /**
   * Perform a DJ search by name
   */
  async searchForDJ(djName: string): Promise<void> {
    await this.searchFilters.enterSearchTerm(djName);
    await this.waitForSearchResults();
  }

  /**
   * Verify that search results contain a specific DJ
   */
  async verifyDJInResults(djName: string): Promise<void> {
    await this.djList.verifyDJCardExists(djName);
  }

  /**
   * Get the number of search results
   */
  async getResultsCount(): Promise<number> {
    return await this.djList.getDisplayedDJCount();
  }

  /**
   * Check if error state is displayed
   */
  async hasError(): Promise<boolean> {
    try {
      await expect(this.errorSection).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retry search when error occurs
   */
  async retrySearch(): Promise<void> {
    await expect(this.retryButton).toBeVisible();
    await this.retryButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Clear all search filters and reset to initial state
   */
  async clearAllFilters(): Promise<void> {
    await this.searchFilters.clearAllFilters();
    await this.waitForSearchResults();
  }

  /**
   * Verify the search page is in initial state (no active filters)
   */
  async verifyInitialState(): Promise<void> {
    await this.searchFilters.verifyNoActiveFilters();
    await expect(this.resultsSection).toBeVisible();
  }

  /**
   * Close music style filter dropdown by clicking outside
   */
  async closeMusicStyleFilter(): Promise<void> {
    const dropdown = this.page.locator('[role="listbox"]');
    
    if (await dropdown.isVisible()) {
      // Click on the page body outside any interactive elements
      await this.page.locator('body').click({ position: { x: 10, y: 10 } });
      // await this.page.waitForSelector('[role="listbox"]', { state: 'hidden' });
    }
  }
} 