import { type Page, type Locator, expect } from '@playwright/test';
import { CalendarComponent } from './CalendarComponent';

/**
 * Event form data interface
 */
export interface EventFormData {
  eventName: string;
  country: string;
  city: string;
  venueName: string;
  eventDate: string;
  eventTime?: string;
}

/**
 * AddEventFormComponent Page Object Model
 * Handles interactions with the Add Event form
 */
export class AddEventFormComponent {
  readonly page: Page;
  readonly formContainer: Locator;
  readonly formTitle: Locator;
  readonly eventNameInput: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly venueNameInput: Locator;
  readonly eventDateInput: Locator;
  readonly eventTimeInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly calendar: CalendarComponent;

  // Field error locators
  readonly eventNameError: Locator;
  readonly countryError: Locator;
  readonly cityError: Locator;
  readonly venueNameError: Locator;
  readonly eventDateError: Locator;
  readonly eventTimeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.calendar = new CalendarComponent(page);
    this.formContainer = page.getByTestId('add-event-form');
    this.formTitle = page.locator('h2', { hasText: 'Add New Event' });
    this.eventNameInput = page.getByTestId('add-event-name-input');
    this.countryInput = page.getByTestId('add-event-country-input');
    this.cityInput = page.getByTestId('add-event-city-input');
    this.venueNameInput = page.getByTestId('add-event-venue-input');
    this.eventDateInput = page.locator('.p-datepicker-input')
    this.eventTimeInput = page.getByTestId('add-event-time-input');
    this.submitButton = page.getByTestId('add-event-submit-button');
    this.cancelButton = page.getByTestId('add-event-cancel-button');
    this.successMessage = page.getByTestId('event-success-message');
    this.errorMessage = page.getByTestId('event-error-message');
    this.loadingSpinner = page.locator('.animate-spin');

    // Field error locators
    this.eventNameError = this.eventNameInput.locator('..').locator('.p-error');
    this.countryError = this.countryInput.locator('..').locator('.p-error');
    this.cityError = this.cityInput.locator('..').locator('.p-error');
    this.venueNameError = this.venueNameInput.locator('..').locator('.p-error');
    this.eventDateError = this.eventDateInput.locator('..').locator('.p-error');
    this.eventTimeError = this.eventTimeInput.locator('..').locator('.p-error');
  }

  /**
   * Wait for the form to be visible and ready for interaction
   */
  async waitForFormReady(): Promise<void> {
    await expect(this.formContainer).toBeVisible();
    await expect(this.formTitle).toBeVisible();
    await expect(this.eventNameInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    
    // Ensure form is not in loading state
    await expect(this.loadingSpinner).not.toBeVisible();
  }

  /**
   * Fill the event name field
   */
  async fillEventName(eventName: string): Promise<void> {
    await expect(this.eventNameInput).toBeVisible();
    await expect(this.eventNameInput).toBeEnabled();
    
    await this.eventNameInput.clear();
    await this.eventNameInput.fill(eventName);
  }

  /**
   * Fill the country field
   */
  async fillCountry(country: string): Promise<void> {
    await expect(this.countryInput).toBeVisible();
    await expect(this.countryInput).toBeEnabled();
    
    await this.countryInput.clear();
    await this.countryInput.fill(country);
  }

  /**
   * Fill the city field
   */
  async fillCity(city: string): Promise<void> {
    await expect(this.cityInput).toBeVisible();
    await expect(this.cityInput).toBeEnabled();
    
    await this.cityInput.clear();
    await this.cityInput.fill(city);
  }

  /**
   * Fill the venue name field
   */
  async fillVenueName(venueName: string): Promise<void> {
    await expect(this.venueNameInput).toBeVisible();
    await expect(this.venueNameInput).toBeEnabled();
    
    await this.venueNameInput.clear();
    await this.venueNameInput.fill(venueName);
  }

  /**
   * Fill the event date field using direct input
   */
  async fillEventDate(eventDate: string): Promise<void> {
    await expect(this.eventDateInput).toBeVisible();
    await expect(this.eventDateInput).toBeEnabled();
    
    await this.eventDateInput.clear();
    await this.eventDateInput.fill(eventDate);
    
    // Click outside to close date picker if it opened
    await this.page.locator('body').click();
  }

  /**
   * Open the date picker calendar
   */
  async openDatePicker(): Promise<void> {
    await expect(this.eventDateInput).toBeVisible();
    await expect(this.eventDateInput).toBeEnabled();
    
    // Click on the date input to open the calendar
    await this.eventDateInput.click();
    
    // Wait for calendar to appear
    await this.calendar.waitForCalendarReady();
  }

  /**
   * Select a date using the calendar picker
   * @param day - The day to select in the current month
   */
  async selectDateFromCalendar(day: number): Promise<void> {
    await this.openDatePicker();
    await this.calendar.selectDay(day);
    
    // Wait for calendar to close
    await expect(this.calendar.calendarPanel).not.toBeVisible({ timeout: 2000 });
  }

  /**
   * Select today's date using the calendar picker
   */
  async selectTodayFromCalendar(): Promise<void> {
    await this.openDatePicker();
    await this.calendar.selectToday();
    
    // Wait for calendar to close
    await expect(this.calendar.calendarPanel).not.toBeVisible({ timeout: 2000 });
  }

  /**
   * Navigate to a specific month/year and select a date
   * @param month - Target month (e.g., "June")
   * @param year - Target year (e.g., "2025")
   * @param day - Day to select
   */
  async selectDateFromCalendarWithNavigation(month: string, year: string, day: number): Promise<void> {
    await this.openDatePicker();
    await this.calendar.navigateToDate(month, year);
    await this.calendar.selectDay(day);
    
    // Wait for calendar to close
    await expect(this.calendar.calendarPanel).not.toBeVisible({ timeout: 2000 });
  }

  /**
   * Fill the event time field (optional)
   */
  async fillEventTime(eventTime: string): Promise<void> {
    await expect(this.eventTimeInput).toBeVisible();
    await expect(this.eventTimeInput).toBeEnabled();
    
    await this.eventTimeInput.clear();
    await this.eventTimeInput.fill(eventTime);
  }

  /**
   * Fill all form fields with provided data
   */
  async fillForm(data: EventFormData): Promise<void> {
    await this.fillEventName(data.eventName);
    await this.fillCountry(data.country);
    await this.fillCity(data.city);
    await this.fillVenueName(data.venueName);
    await this.fillEventDate(data.eventDate);
    
    if (data.eventTime) {
      await this.fillEventTime(data.eventTime);
    }
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
    
    await this.submitButton.click();
  }

  /**
   * Cancel the form
   */
  async cancelForm(): Promise<void> {
    await expect(this.cancelButton).toBeVisible();
    await expect(this.cancelButton).toBeEnabled();
    
    await this.cancelButton.click();
    
    // Wait for form to disappear
    await expect(this.formContainer).not.toBeVisible();
  }

  /**
   * Complete the entire form submission process
   */
  async createEvent(data: EventFormData): Promise<void> {
    await this.waitForFormReady();
    await this.fillForm(data);
    await this.submitForm();
  }

  /**
   * Wait for successful form submission
   */
  async waitForSuccess(): Promise<void> {
    // await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    
    // Wait for form to disappear after success
    await expect(this.formContainer).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Wait for form submission error
   */
  async waitForError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get the success message text
   */
  async getSuccessMessage(): Promise<string> {
    await expect(this.successMessage).toBeVisible();
    return await this.successMessage.textContent() || '';
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Verify form validation states
   */
  async verifyFormValidation(): Promise<void> {
    // Initially submit button should be disabled
    await expect(this.submitButton).toBeDisabled();
    
    // Fill required fields one by one and check validation
    await this.fillEventName('Test Event');
    await expect(this.submitButton).toBeDisabled();
    
    await this.fillCountry('Germany');
    await expect(this.submitButton).toBeDisabled();
    
    await this.fillCity('Berlin');
    await expect(this.submitButton).toBeDisabled();
    
    await this.fillVenueName('Test Venue');
    await expect(this.submitButton).toBeDisabled();
    
    // After filling all required fields, submit should be enabled

    await this.fillEventDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Verify specific field validation error
   */
  async verifyFieldError(field: 'eventName' | 'country' | 'city' | 'venueName' | 'eventDate' | 'eventTime', expectedError: string): Promise<void> {
    const errorLocator = {
      eventName: this.eventNameError,
      country: this.countryError,
      city: this.cityError,
      venueName: this.venueNameError,
      eventDate: this.eventDateError,
      eventTime: this.eventTimeError,
    }[field];
    
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(expectedError);
  }

  /**
   * Check if the form is currently visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await expect(this.formContainer).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the form is in loading state
   */
  async isLoading(): Promise<boolean> {
    try {
      await expect(this.loadingSpinner).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
} 