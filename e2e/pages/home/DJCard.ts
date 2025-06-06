import { type Page, type Locator, expect } from '@playwright/test';

/**
 * DJCard Page Object Model
 * Handles interactions with individual DJ card elements
 */
export class DJCard {
  readonly page: Page;
  readonly cardElement: Locator;
  readonly artistName: string;
  readonly artistNameElement: Locator;
  readonly biographyElement: Locator;
  readonly musicStylesElement: Locator;
  readonly eventsCountElement: Locator;
  readonly viewProfileButton: Locator;

  constructor(page: Page, cardElement: Locator, artistName: string) {
    this.page = page;
    this.cardElement = cardElement;
    this.artistName = artistName;
    this.artistNameElement = cardElement.getByTestId('dj-artist-name');
    this.biographyElement = cardElement.getByTestId('dj-biography');
    this.musicStylesElement = cardElement.getByTestId('dj-music-styles');
    this.eventsCountElement = cardElement.getByTestId('dj-events-count');
    this.viewProfileButton = cardElement.getByTestId('view-profile-button');
  }

  /**
   * Wait for the DJ card to be visible
   */
  async waitForCardVisible(): Promise<void> {
    await expect(this.cardElement).toBeVisible();
    await expect(this.artistNameElement).toBeVisible();
  }

  /**
   * Get the artist name displayed on the card
   */
  async getArtistName(): Promise<string> {
    await expect(this.artistNameElement).toBeVisible();
    return await this.artistNameElement.textContent() || '';
  }

  /**
   * Get the biography text displayed on the card
   */
  async getBiography(): Promise<string> {
    await expect(this.biographyElement).toBeVisible();
    return await this.biographyElement.textContent() || '';
  }

  /**
   * Get the events count text
   */
  async getEventsCountText(): Promise<string> {
    await expect(this.eventsCountElement).toBeVisible();
    return await this.eventsCountElement.textContent() || '';
  }

  /**
   * Get all music style tags displayed on the card
   */
  async getMusicStyles(): Promise<string[]> {
    const tags = this.musicStylesElement.locator('[data-pc-name="tag"]');
    const count = await tags.count();
    const styles: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const tagText = await tags.nth(i).textContent();
      if (tagText) {
        styles.push(tagText.trim());
      }
    }
    
    return styles;
  }

  /**
   * Check if the card has a specific music style
   */
  async hasMusicStyle(styleName: string): Promise<boolean> {
    const styles = await this.getMusicStyles();
    return styles.includes(styleName);
  }

  /**
   * Click the "View Profile" button
   */
  async clickViewProfile(): Promise<void> {
    await expect(this.viewProfileButton).toBeVisible();
    await expect(this.viewProfileButton).toBeEnabled();
    await this.viewProfileButton.click();
  }

  /**
   * Verify the card displays the expected artist name
   */
  async verifyArtistName(expectedName: string): Promise<void> {
    await expect(this.artistNameElement).toHaveText(expectedName);
  }

  /**
   * Verify the card has biography content
   */
  async verifyHasBiography(): Promise<void> {
    await expect(this.biographyElement).toBeVisible();
    const biography = await this.getBiography();
    expect(biography.length).toBeGreaterThan(0);
    expect(biography).not.toBe('No biography available');
  }

  /**
   * Verify the card displays music styles
   */
  async verifyHasMusicStyles(): Promise<void> {
    await expect(this.musicStylesElement).toBeVisible();
    const styles = await this.getMusicStyles();
    expect(styles.length).toBeGreaterThan(0);
  }

  /**
   * Verify the events count is displayed
   */
  async verifyEventsCount(): Promise<void> {
    await expect(this.eventsCountElement).toBeVisible();
    const eventsText = await this.getEventsCountText();
    expect(eventsText).toMatch(/\d+ (upcoming )?events?|No upcoming events/);
  }

  /**
   * Verify the view profile button is functional
   */
  async verifyViewProfileButton(): Promise<void> {
    await expect(this.viewProfileButton).toBeVisible();
    await expect(this.viewProfileButton).toBeEnabled();
    await expect(this.viewProfileButton).toHaveText('View Profile');
  }

  /**
   * Get the DJ ID from data attribute
   */
  async getDJId(): Promise<string | null> {
    return await this.cardElement.getAttribute('data-dj-id');
  }

  /**
   * Get the DJ name from data attribute
   */
  async getDataDJName(): Promise<string | null> {
    return await this.cardElement.getAttribute('data-dj-name');
  }

  /**
   * Verify all card elements are properly displayed
   */
  async verifyCardComplete(): Promise<void> {
    await this.waitForCardVisible();
    await this.verifyArtistName(this.artistName);
    await this.verifyHasBiography();
    await this.verifyEventsCount();
    await this.verifyViewProfileButton();
    
    // Music styles are optional, so only verify if present
    const styles = await this.getMusicStyles();
    if (styles.length > 0) {
      await this.verifyHasMusicStyles();
    }
  }

  /**
   * Hover over the card to trigger hover effects
   */
  async hoverCard(): Promise<void> {
    await this.cardElement.hover();
  }

  /**
   * Scroll the card into view if not visible
   */
  async scrollIntoView(): Promise<void> {
    await this.cardElement.scrollIntoViewIfNeeded();
  }
} 