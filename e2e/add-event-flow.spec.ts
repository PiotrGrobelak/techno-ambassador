import { test, expect } from '@playwright/test';
import { 
  EventsManagementPage, 
  AddEventFormComponent, 
  EventsListComponent,
  type EventFormData 
} from './pages/events';
  import { NavigationComponent } from './pages/shared/NavigationComponent';

test.describe('Add Event Flow', () => {
  let navigation: NavigationComponent;
  let eventsManagementPage: EventsManagementPage;
  let addEventForm: AddEventFormComponent;
  let eventsList: EventsListComponent;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    navigation = new NavigationComponent(page);
    eventsManagementPage = new EventsManagementPage(page);
    addEventForm = new AddEventFormComponent(page);
    eventsList = new EventsListComponent(page);

    // Navigate to dashboard first to ensure authenticated navigation is available
    // The user is already authenticated via the setup project
    await page.goto('/dj/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for navigation to be ready
    await page.waitForTimeout(1000); // Give time for Vue components to mount
  });

  test('should complete add event flow - happy path', async ({ page }) => {
    // Test data
    const eventData: EventFormData = {
      eventName: `Techno Night Berlin ${new Date().getTime()}`,
      country: 'Germany',
      city: 'Berlin',
      venueName: 'Berghain',
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: '23:00'
    };

    // Step 1: Navigate to Events Management page
    await test.step('Navigate to Events Management', async () => {
      await navigation.clickEventsManagement();
      await eventsManagementPage.verifyPageReady();
    });

    // Step 2: Open Add Event form
    await test.step('Open Add Event form', async () => {
      await eventsManagementPage.verifyAddEventButtonAvailable();
      await eventsManagementPage.clickAddEvent();
      await addEventForm.waitForFormReady();
    });

    // Step 3: Fill and submit the form
    await test.step('Fill and submit Add Event form', async () => {
      await addEventForm.fillForm(eventData);
      await addEventForm.submitForm();
      await addEventForm.waitForSuccess();
    });

    // Step 4: Verify event appears in the list
    await test.step('Verify event appears in events list', async () => {
      await eventsList.waitForListLoad();
      
      // Wait for the new event to appear
      const eventId = await eventsList.waitForNewEvent(eventData.eventName);
      expect(eventId).toBeTruthy();
      
      if (eventId) {
        await eventsList.verifyEventDetails(eventId, {
          id: eventId,
          eventName: eventData.eventName,
          venueName: eventData.venueName,
          city: eventData.city,
          country: eventData.country,
          eventDate: eventData.eventDate,
          eventTime: eventData.eventTime
        });
      }
    });

    // Step 5: Verify stats updated
    await test.step('Verify event statistics updated', async () => {
      const stats = await eventsManagementPage.getEventStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.upcoming).toBeGreaterThan(0);
    });
  });

  test('should validate add event form', async ({ page }) => {
    // Navigate to Events Management and open form
    await navigation.clickEventsManagement();
    await eventsManagementPage.clickAddEvent();
    await addEventForm.waitForFormReady();

    // Test form validation
    await test.step('Verify form validation rules', async () => {
      await addEventForm.verifyFormValidation();
    });

    // Test individual field validation
    await test.step('Test individual field validation', async () => {
      // Try to submit empty form
      await addEventForm.submitForm();
      
      // Verify required field errors would appear
      // (This depends on your validation implementation)
    });
  });

  test('should cancel add event flow', async ({ page }) => {
    // Navigate to Events Management and open form
    await navigation.clickEventsManagement();
    await eventsManagementPage.clickAddEvent();
    await addEventForm.waitForFormReady();

    // Fill form partially and cancel
    await test.step('Fill form and cancel', async () => {
      await addEventForm.fillEventName('Test Event');
      await addEventForm.fillCountry('Germany');
      
      await addEventForm.cancelForm();
      
      // Verify form is closed
      expect(await addEventForm.isVisible()).toBeFalsy();
    });
  });
}); 