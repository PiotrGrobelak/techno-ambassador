import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { LoginPage } from './pages/auth';
import { DashboardPage } from './pages/profile';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store authentication state
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  // Navigate to login page
  await loginPage.goto();
  await loginPage.waitForFormReady();

  // Perform authentication using environment variables
  const email = process.env.USER_LOGIN;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    throw new Error('USER_LOGIN and USER_PASSWORD environment variables must be set for authentication setup');
  }

  // Fill in credentials and submit
  await loginPage.fillEmail(email);
  await loginPage.fillPassword(password);
  await loginPage.submitForm();

  // Wait for successful login - check for dashboard or success state
  await Promise.race([
    page.waitForURL('**/dj/dashboard**', { timeout: 15000 }),
    dashboardPage.waitForDashboardLoad()
  ]);

  // Verify we're successfully authenticated
  await dashboardPage.verifyAuthenticatedState();

  // Save the authentication state to file
  await page.context().storageState({ path: authFile });

  console.log('Authentication setup completed successfully');
}); 