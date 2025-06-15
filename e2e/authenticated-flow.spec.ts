import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/profile';
import { NavigationComponent } from './pages/shared/NavigationComponent';
import { verifyAuthState, waitForPageReady, safeNavigate } from './test-utils';

/**
 * Example Authenticated Tests
 * These tests run with a pre-authenticated user state
 * The authentication is handled by the setup project
 */

test.describe('Authenticated Flow', () => {
  let dashboardPage: DashboardPage;
  let navigation: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Object Models
    dashboardPage = new DashboardPage(page);
    navigation = new NavigationComponent(page);
    
    // Verify authentication state is loaded
    const isAuthenticated = await verifyAuthState(page);
    if (!isAuthenticated) {
      console.warn('Authentication state not detected, test may fail');
    }
  });

  test('should access dashboard directly when authenticated', async ({ page }) => {
    // Navigate directly to dashboard using safe navigation
    await safeNavigate(page, '/dj/dashboard');
    await waitForPageReady(page);

    // Verify we can access the dashboard without being redirected to login
    await dashboardPage.waitForDashboardLoad();
    await dashboardPage.verifyDashboardAccess();    
    await navigation.verifyAuthenticatedState();
  });

  test('should maintain authentication across page navigation', async ({ page }) => {
    // Navigate to dashboard
    await safeNavigate(page, '/dj/dashboard');
    await waitForPageReady(page);
    await navigation.verifyAuthenticatedState();
    
    // Navigate back to homepage
    await safeNavigate(page, '/');
    await waitForPageReady(page);
    await navigation.verifyAuthenticatedState();
  });

  test('should be able to logout from authenticated state', async ({ page }) => {
    // Navigate to dashboard
    await safeNavigate(page, '/dj/dashboard');
    await waitForPageReady(page);
    await navigation.verifyAuthenticatedState();
    
    // Logout
    await navigation.signOut();
    
    // Wait for logout to complete
    await waitForPageReady(page);
    
    // Verify unauthenticated state
    await navigation.verifyUnauthenticatedState();
    
    // Try to access dashboard again - should be redirected to login
    await page.goto('/dj/dashboard');
    await waitForPageReady(page);
    
    // Check if we were redirected to login
    const currentUrl = page.url();
    expect(currentUrl).toContain('/auth/login');
  });
}); 