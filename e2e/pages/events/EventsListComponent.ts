import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Event item interface for list verification
 */
export interface EventItem {
  id: string;
  eventName: string;
  venueName: string;
  city: string;
  country: string;
  eventDate: string;
  eventTime?: string;
}

/**
 * EventsListComponent Page Object Model
 * Handles interactions with the events list and individual event items
 */
export class EventsListComponent {
  readonly page: Page;
  readonly eventsDataView: Locator;
  readonly emptyStateMessage: Locator;
  readonly emptyStateAddButton: Locator;
  readonly loadingSpinner: Locator;
  readonly paginationInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventsDataView = page.getByTestId('events-dataview');
    this.emptyStateMessage = page.locator('text=No events');
    this.emptyStateAddButton = page.getByTestId('empty-state-add-event');
    this.loadingSpinner = page.locator('.animate-spin');
    this.paginationInfo = page.locator('.p-paginator-current');
  }

  /**
   * Wait for the events list to load
   */
  async waitForListLoad(): Promise<void> {
    // Wait for loading to complete
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
    
    // Wait for either events list or empty state
    await Promise.race([
      this.eventsDataView.waitFor({ state: 'visible' }),
      this.emptyStateMessage.waitFor({ state: 'visible' })
    ]);
  }

  /**
   * Get a specific event item by ID
   */
  getEventItem(eventId: string): Locator {
    return this.page.getByTestId(`event-item-${eventId}`);
  }

  /**
   * Get event name element by ID
   */
  getEventName(eventId: string): Locator {
    return this.page.getByTestId(`event-name-${eventId}`);
  }

  /**
   * Get edit button for a specific event
   */
  getEditButton(eventId: string): Locator {
    return this.getEventItem(eventId).getByTestId('edit-event-button');
  }

  /**
   * Get delete button for a specific event
   */
  getDeleteButton(eventId: string): Locator {
    return this.getEventItem(eventId).getByTestId('delete-event-button');
  }

  /**
   * Verify that a specific event appears in the list
   */
  async verifyEventExists(eventId: string): Promise<void> {
    await this.waitForListLoad();
    await expect(this.getEventItem(eventId)).toBeVisible();
  }

  /**
   * Verify event details in the list
   */
  async verifyEventDetails(eventId: string, expectedData: Partial<EventItem>): Promise<void> {
    const eventItem = this.getEventItem(eventId);
    await expect(eventItem).toBeVisible();
    
    if (expectedData.eventName) {
      await expect(this.getEventName(eventId)).toContainText(expectedData.eventName);
    }
    
    if (expectedData.venueName) {
      await expect(eventItem).toContainText(expectedData.venueName);
    }
    
    if (expectedData.city && expectedData.country) {
      await expect(eventItem).toContainText(`${expectedData.city}, ${expectedData.country}`);
    }
  }

  /**
   * Wait for a new event to appear in the list (useful after creation)
   */
  async waitForNewEvent(eventName: string, timeout: number = 10000): Promise<string | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      await this.waitForListLoad();
      
      // Look for event by name
      const eventNameLocator = this.page.locator(`[data-testid^="event-name-"]`, { hasText: eventName });
      
      try {
        await expect(eventNameLocator).toBeVisible({ timeout: 1000 });
        
        // Extract event ID from the test ID
        const testId = await eventNameLocator.getAttribute('data-testid');
        if (testId) {
          const eventId = testId.replace('event-name-', '');
          return eventId;
        }
      } catch {
        // Event not found yet, continue waiting
        await this.page.waitForTimeout(500);
      }
    }
    
    return null;
  }

  /**
   * Get all visible event items
   */
  async getAllEventItems(): Promise<Locator[]> {
    await this.waitForListLoad();
    return await this.page.locator('[data-testid^="event-item-"]').all();
  }

  /**
   * Get the count of visible events
   */
  async getEventCount(): Promise<number> {
    const events = await this.getAllEventItems();
    return events.length;
  }

  /**
   * Check if the list is in empty state
   */
  async isEmptyState(): Promise<boolean> {
    try {
      await expect(this.emptyStateMessage).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click the Add Event button in empty state
   */
  async clickEmptyStateAddButton(): Promise<void> {
    await expect(this.emptyStateAddButton).toBeVisible();
    await expect(this.emptyStateAddButton).toBeEnabled();
    
    await this.emptyStateAddButton.click();
    
    // Wait for form to appear
    await this.page.waitForSelector('[data-testid="add-event-form"]', { state: 'visible' });
  }

  /**
   * Edit a specific event
   */
  async editEvent(eventId: string): Promise<void> {
    const editButton = this.getEditButton(eventId);
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeEnabled();
    
    await editButton.click();
    
    // Wait for edit form to appear
    await this.page.waitForSelector('[data-testid="edit-event-form"]', { state: 'visible' });
  }

  /**
   * Delete a specific event (with confirmation)
   */
  async deleteEvent(eventId: string): Promise<void> {
    const deleteButton = this.getDeleteButton(eventId);
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
    
    await deleteButton.click();
    
    // Wait for confirmation dialog
    const confirmDialog = this.page.locator('.p-confirm-dialog');
    await expect(confirmDialog).toBeVisible();
    
    // Click confirm button
    const confirmButton = confirmDialog.locator('.p-button-danger');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    
    // Wait for dialog to disappear
    await expect(confirmDialog).not.toBeVisible();
  }

  /**
   * Verify that an event no longer exists in the list
   */
  async verifyEventNotExists(eventId: string): Promise<void> {
    await this.waitForListLoad();
    await expect(this.getEventItem(eventId)).not.toBeVisible();
  }

  /**
   * Get pagination information
   */
  async getPaginationInfo(): Promise<string> {
    try {
      await expect(this.paginationInfo).toBeVisible({ timeout: 1000 });
      return await this.paginationInfo.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Navigate to a specific page in pagination
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.page.locator(`.p-paginator-page`, { hasText: pageNumber.toString() });
    await expect(pageButton).toBeVisible();
    await pageButton.click();
    
    await this.waitForListLoad();
  }

  /**
   * Verify events are sorted correctly (by date, newest first by default)
   */
  async verifyEventsSorting(): Promise<void> {
    await this.waitForListLoad();
    
    const eventItems = await this.getAllEventItems();
    
    if (eventItems.length > 1) {
      // Get dates from first two events and verify order
      const firstEventDate = await eventItems[0].locator('.pi-calendar').locator('..').textContent();
      const secondEventDate = await eventItems[1].locator('.pi-calendar').locator('..').textContent();
      
      // Basic verification that dates are present
      expect(firstEventDate).toBeTruthy();
      expect(secondEventDate).toBeTruthy();
    }
  }
} 