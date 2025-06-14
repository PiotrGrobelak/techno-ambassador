import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Calendar component Page Object Model
 * Handles interactions with PrimeVue datepicker calendar
 */
export class CalendarComponent {
  readonly page: Page;
  readonly calendarPanel: Locator;
  readonly calendarContainer: Locator;
  readonly calendar: Locator;
  readonly header: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly monthButton: Locator;
  readonly yearButton: Locator;
  readonly dayView: Locator;
  readonly weekdayHeaders: Locator;
  readonly daysCells: Locator;
  readonly todayCell: Locator;
  readonly disabledDays: Locator;
  readonly otherMonthDays: Locator;

  constructor(page: Page) {
    this.page = page;
    this.calendarPanel = page.locator('[id*="date_panel"].p-datepicker-panel');
    this.calendarContainer = this.calendarPanel.locator('.p-datepicker-calendar-container');
    this.calendar = this.calendarContainer.locator('.p-datepicker-calendar');
    this.header = this.calendar.locator('.p-datepicker-header');
    this.previousButton = this.header.locator('.p-datepicker-prev-button');
    this.nextButton = this.header.locator('.p-datepicker-next-button');
    this.monthButton = this.header.locator('.p-datepicker-select-month');
    this.yearButton = this.header.locator('.p-datepicker-select-year');
    this.dayView = this.calendar.locator('.p-datepicker-day-view');
    this.weekdayHeaders = this.dayView.locator('thead .p-datepicker-weekday');
    this.daysCells = this.dayView.locator('tbody .p-datepicker-day-cell');
    this.todayCell = this.dayView.locator('.p-datepicker-today');
    this.disabledDays = this.dayView.locator('.p-datepicker-day.p-disabled');
    this.otherMonthDays = this.dayView.locator('.p-datepicker-other-month');
  }

  /**
   * Wait for the calendar to be visible and ready for interaction
   */
  async waitForCalendarReady(): Promise<void> {
    await expect(this.calendarPanel).toBeVisible();
    await expect(this.calendar).toBeVisible();
    await expect(this.header).toBeVisible();
    await expect(this.dayView).toBeVisible();
  }

  /**
   * Check if the calendar is currently visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await expect(this.calendarPanel).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current month displayed in the calendar
   */
  async getCurrentMonth(): Promise<string> {
    await expect(this.monthButton).toBeVisible();
    return await this.monthButton.textContent() || '';
  }

  /**
   * Get the current year displayed in the calendar
   */
  async getCurrentYear(): Promise<string> {
    await expect(this.yearButton).toBeVisible();
    return await this.yearButton.textContent() || '';
  }

  /**
   * Navigate to the previous month
   */
  async goToPreviousMonth(): Promise<void> {
    await expect(this.previousButton).toBeVisible();
    await expect(this.previousButton).toBeEnabled();
    await this.previousButton.click();
    
    // Wait for calendar to update
    await this.page.waitForTimeout(300);
  }

  /**
   * Navigate to the next month
   */
  async goToNextMonth(): Promise<void> {
    await expect(this.nextButton).toBeVisible();
    await expect(this.nextButton).toBeEnabled();
    await this.nextButton.click();
    
    // Wait for calendar to update
    await this.page.waitForTimeout(300);
  }

  /**
   * Click on the month button to open month selector
   */
  async clickMonthSelector(): Promise<void> {
    await expect(this.monthButton).toBeVisible();
    await expect(this.monthButton).toBeEnabled();
    await this.monthButton.click();
  }

  /**
   * Click on the year button to open year selector
   */
  async clickYearSelector(): Promise<void> {
    await expect(this.yearButton).toBeVisible();
    await expect(this.yearButton).toBeEnabled();
    await this.yearButton.click();
  }

  /**
   * Select a specific day in the current month view
   * @param day - The day number to select (1-31)
   */
  async selectDay(day: number): Promise<void> {
    const dayCell = this.daysCells.filter({
      has: this.page.locator('.p-datepicker-day', { hasText: day.toString() })
    }).filter({
      hasNot: this.page.locator('.p-datepicker-other-month')
    }).first();

    await expect(dayCell).toBeVisible();
    
    const dayElement = dayCell.locator('.p-datepicker-day');
    await expect(dayElement).not.toHaveClass(/p-disabled/);
    await dayElement.click();
  }

  /**
   * Select today's date if it's available
   */
  async selectToday(): Promise<void> {
    await expect(this.todayCell).toBeVisible();
    
    const todayElement = this.todayCell.locator('.p-datepicker-day');
    await expect(todayElement).not.toHaveClass(/p-disabled/);
    await todayElement.click();
  }

  /**
   * Get all available (non-disabled) days in the current month
   */
  async getAvailableDays(): Promise<string[]> {
    const availableDays: string[] = [];
    const dayCells = await this.daysCells.filter({
      hasNot: this.page.locator('.p-datepicker-other-month')
    }).all();

    for (const cell of dayCells) {
      const dayElement = cell.locator('.p-datepicker-day');
      const isDisabled = await dayElement.getAttribute('aria-disabled') === 'true';
      
      if (!isDisabled) {
        const dayText = await dayElement.textContent();
        if (dayText) {
          availableDays.push(dayText.trim());
        }
      }
    }

    return availableDays;
  }

  /**
   * Get all disabled days in the current month
   */
  async getDisabledDays(): Promise<string[]> {
    const disabledDays: string[] = [];
    const disabledCells = await this.disabledDays.filter({
      hasNot: this.page.locator('.p-datepicker-other-month')
    }).all();

    for (const cell of disabledCells) {
      const dayText = await cell.textContent();
      if (dayText) {
        disabledDays.push(dayText.trim());
      }
    }

    return disabledDays;
  }

  /**
   * Get the weekday headers (Su, Mo, Tu, etc.)
   */
  async getWeekdayHeaders(): Promise<string[]> {
    const headers: string[] = [];
    const headerElements = await this.weekdayHeaders.all();

    for (const header of headerElements) {
      const text = await header.textContent();
      if (text) {
        headers.push(text.trim());
      }
    }

    return headers;
  }

  /**
   * Navigate to a specific month and year
   */
  async navigateToDate(month: string, year: string): Promise<void> {
    const currentMonth = await this.getCurrentMonth();
    const currentYear = await this.getCurrentYear();

    // If we're already at the target date, return
    if (currentMonth === month && currentYear === year) {
      return;
    }

    // Navigate by clicking previous/next buttons
    // This is a simplified approach - in a real scenario you might want
    // to use the month/year selectors for more efficient navigation
    const targetDate = new Date(`${month} 1, ${year}`);
    const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);

    if (targetDate > currentDate) {
      // Navigate forward
      while (await this.getCurrentMonth() !== month || await this.getCurrentYear() !== year) {
        await this.goToNextMonth();
      }
    } else if (targetDate < currentDate) {
      // Navigate backward
      while (await this.getCurrentMonth() !== month || await this.getCurrentYear() !== year) {
        await this.goToPreviousMonth();
      }
    }
  }

  /**
   * Close the calendar by clicking outside
   */
  async closeCalendar(): Promise<void> {
    // Click outside the calendar to close it
    await this.page.locator('body').click({ position: { x: 0, y: 0 } });
    
    // Wait for calendar to disappear
    await expect(this.calendarPanel).not.toBeVisible({ timeout: 2000 });
  }
} 