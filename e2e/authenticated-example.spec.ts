import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/profile';
import { NavigationComponent } from './pages/auth';

/**
 * Example Authenticated Tests
 * These tests run with a pre-authenticated user state
 * The authentication is handled by the setup project
 */

test.describe('Authenticated User Tests', () => {
  let dashboardPage: DashboardPage;
  let navigation: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Object Models
    dashboardPage = new DashboardPage(page);
    navigation = new NavigationComponent(page);
  });

  test('should access dashboard directly when authenticated', async ({ page }) => {
    // Navigate directly to dashboard - should work because user is pre-authenticated
    await dashboardPage.goto();
    
    // Verify we can access the dashboard without being redirected to login
    await dashboardPage.waitForDashboardLoad();
    await dashboardPage.verifyDashboardAccess();
    await dashboardPage.verifyAuthenticatedState();
    
    // Verify navigation shows authenticated state
    await navigation.verifyAuthenticatedState();
  });

  test('should maintain authentication across page navigation', async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify authenticated state on homepage
    await navigation.verifyAuthenticatedState();
    
    // Navigate to dashboard
    await dashboardPage.goto();
    await dashboardPage.verifyAuthenticatedState();
    
    // Navigate back to homepage
    await page.goto('/');
    await navigation.verifyAuthenticatedState();
  });

  test('should be able to logout from authenticated state', async ({ page }) => {
    // Navigate to dashboard
    await dashboardPage.goto();
    await dashboardPage.verifyAuthenticatedState();
    
    // Logout
    await navigation.signOut();
    
    // Verify unauthenticated state
    await navigation.verifyUnauthenticatedState();
    
    // Try to access dashboard again - should be redirected to login
    await dashboardPage.goto();
    await page.waitForURL('**/auth/login**');
    expect(page.url()).toContain('/auth/login');
  });
}); 