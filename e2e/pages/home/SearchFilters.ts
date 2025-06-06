import { type Page, type Locator, expect } from '@playwright/test';

/**
 * SearchFilters Page Object Model
 * Handles search input field and filter interactions
 */
export class SearchFilters {
  readonly page: Page;
  readonly filtersContainer: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly musicStyleFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly activeFiltersText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filtersContainer = page.getByTestId('search-filters-container');
    this.searchInput = page.getByTestId('dj-search-input');
    this.clearSearchButton = page.getByTestId('clear-search-button');
    this.musicStyleFilter = page.getByTestId('music-style-multiselect');
    this.clearFiltersButton = page.getByTestId('clear-filters-button');
    this.activeFiltersText = page.getByTestId('active-filters-text');
  }

  /**
   * Wait for search filters to be ready
   */
  async waitForFiltersReady(): Promise<void> {
    await expect(this.filtersContainer).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchInput).toBeEnabled();
  }

  /**
   * Enter a search term in the search input field
   */
  async enterSearchTerm(searchTerm: string): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchInput).toBeEnabled();
    
    // Clear existing text first
    await this.searchInput.clear();
    
    // Type the search term
    await this.searchInput.fill(searchTerm);
    
    // Wait for debounced search to trigger (300ms delay + processing time)
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear the search input using the clear button
   */
  async clearSearchInput(): Promise<void> {
    // Only click clear button if it's visible (i.e., there's text to clear)
    if (await this.clearSearchButton.isVisible()) {
      await this.clearSearchButton.click();
      await this.page.waitForTimeout(300); // Wait for debounced clear
    }
  }

  /**
   * Get the current search input value
   */
  async getSearchInputValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  /**
   * Open music style filter dropdown
   */
  async openMusicStyleFilter(): Promise<void> {
    await expect(this.musicStyleFilter).toBeVisible();
    await this.musicStyleFilter.click();
    
    // Wait for dropdown to open
    await this.page.waitForSelector('[role="listbox"]', { state: 'visible' });
  }

  /**
   * Select a music style from the dropdown
   */
  async selectMusicStyle(styleName: string): Promise<void> {
    await this.openMusicStyleFilter();
    
    // Find and click the option with the specified style name
    const option = this.page.locator('[role="option"]').filter({ hasText: styleName });
    await expect(option).toBeVisible();
    await option.click();
    
    // Wait for dropdown to close and filter to apply
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear all active filters
   */
  async clearAllFilters(): Promise<void> {
    // Check if clear button is enabled before clicking
    if (await this.clearFiltersButton.isEnabled()) {
      await this.clearFiltersButton.click();
      await this.page.waitForTimeout(300); // Wait for filters to clear
    }
  }

  /**
   * Get the active filters text
   */
  async getActiveFiltersText(): Promise<string> {
    await expect(this.activeFiltersText).toBeVisible();
    return await this.activeFiltersText.textContent() || '';
  }

  /**
   * Check if there are active filters
   */
  async hasActiveFilters(): Promise<boolean> {
    const filtersText = await this.getActiveFiltersText();
    return !filtersText.includes('No filters applied');
  }

  /**
   * Verify that no filters are currently active
   */
  async verifyNoActiveFilters(): Promise<void> {
    const filtersText = await this.getActiveFiltersText();
    expect(filtersText).toContain('No filters applied');
    await expect(this.clearFiltersButton).toBeDisabled();
  }

  /**
   * Verify that search filter is active with specific term
   */
  async verifySearchFilterActive(searchTerm: string): Promise<void> {
    const filtersText = await this.getActiveFiltersText();
    expect(filtersText).toContain(`Search: "${searchTerm}"`);
    await expect(this.clearFiltersButton).toBeEnabled();
  }

  /**
   * Verify that music style filter is active
   */
  async verifyMusicStyleFilterActive(styleCount: number): Promise<void> {
    const filtersText = await this.getActiveFiltersText();
    const expectedText = styleCount === 1 ? '1 music style' : `${styleCount} music styles`;
    expect(filtersText).toContain(expectedText);
    await expect(this.clearFiltersButton).toBeEnabled();
  }

  /**
   * Wait for search input to be cleared
   */
  async waitForSearchCleared(): Promise<void> {
    await expect(this.searchInput).toHaveValue('');
    await expect(this.clearSearchButton).not.toBeVisible();
  }
} 