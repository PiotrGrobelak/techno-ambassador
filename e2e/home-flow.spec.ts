import { test, expect } from '@playwright/test';
import { HomePage, DJSearchPage } from './pages/home';

/**
 * DJ Search Functionality Tests
 * Tests the complete user journey from homepage to DJ search results
 */
test.describe('Home Page flow', () => {
  let homePage: HomePage;
  let djSearchPage: DJSearchPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    homePage = new HomePage(page);
    djSearchPage = new DJSearchPage(page);
    
    // Navigate to homepage
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test.skip('should complete DJ search user journey', async () => {
    // Step 1: Click "Start Exploring" button
    await test.step('Click "Start Exploring" button', async () => {
      await homePage.verifyHeroContent();
      await homePage.clickStartExploring();
    });

    // Step 2: Wait for view to scroll down to search section
    await test.step('Wait for view to scroll down', async () => {
      await djSearchPage.waitForSearchWidgetReady();
    });

    // Step 3: Type DJ name in search field
    await test.step('Enter DJ name in search field', async () => {
      const djName = 'DJ TechnoMaster'; // Replace with actual DJ name from your data
      await djSearchPage.searchForDJ(djName);
    });

    // Step 4: Verify DJ card appears in search results
    await test.step('Verify DJ card appears in search results', async () => {
      const djName = 'DJ TechnoMaster';
      
      // Verify search results are displayed
      expect(await djSearchPage.hasSearchResults()).toBe(true);
      
      // Verify specific DJ card exists
      await djSearchPage.verifyDJInResults(djName);
      
      // Get DJ card and verify its content
      const djCard = djSearchPage.djList.getDJCard(djName);
      await djCard.verifyCardComplete();
    });
  });

  test('should show empty state when searching for non-existent DJ', async () => {
    await homePage.clickStartExploring();
    await djSearchPage.waitForSearchWidgetReady();
    
    // Search for non-existent DJ
    await djSearchPage.searchForDJ('NonExistentDJName12345');
    
    // Verify empty state is displayed
    expect(await djSearchPage.djList.hasEmptyState()).toBe(true);
    await djSearchPage.djList.verifyEmptyState('No DJs found');
  });

  test('should clear search filters', async () => {
    await homePage.clickStartExploring();
    await djSearchPage.waitForSearchWidgetReady();
    
    // Apply search filter
    await djSearchPage.searchFilters.enterSearchTerm('Test DJ');
    await djSearchPage.searchFilters.verifySearchFilterActive('Test DJ');
    
    // Clear all filters
    await djSearchPage.clearAllFilters();
    await djSearchPage.searchFilters.verifyNoActiveFilters();
  });

  test.skip('should apply music style filter', async () => {  
    await homePage.clickStartExploring();
    await djSearchPage.waitForSearchWidgetReady();
    
    // Select a music style filter
    await djSearchPage.searchFilters.selectMusicStyle('Acid Techno');
    await djSearchPage.waitForSearchResults();
    
    // Close music style filter dropdown
    await djSearchPage.closeMusicStyleFilter();

    // Verify filter is active
    await djSearchPage.searchFilters.verifyMusicStyleFilterActive(1);
    
    // Verify results are filtered
    expect(await djSearchPage.hasSearchResults()).toBe(true);
  });

  test.skip('should load more results', async () => {
    await homePage.clickStartExploring();
    await djSearchPage.waitForSearchWidgetReady();
    
    // Check if load more button is available
    if (await djSearchPage.djList.hasLoadMoreButton()) {
      const initialCount = await djSearchPage.getResultsCount();
      
      // Load more results
      await djSearchPage.djList.loadMoreResults();
      
      // Verify more results were loaded
      const newCount = await djSearchPage.getResultsCount();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should retry search when error occurs', async () => {
    await homePage.clickStartExploring();
    await djSearchPage.waitForSearchWidgetReady();
    
    // Check if there's an error state
    if (await djSearchPage.hasError()) {
      // Test retry functionality
      await djSearchPage.retrySearch();
      await djSearchPage.waitForSearchResults();
    }
  });
}); 