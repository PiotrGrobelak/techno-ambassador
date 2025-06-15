import { type Page, type BrowserContext } from '@playwright/test';

/**
 * Test utilities for better test isolation and reliability
 */

/**
 * Clear all browser storage and reset page state
 */
export async function clearBrowserState(page: Page): Promise<void> {
  try {
    // Clear all storage
    await page.evaluate(() => {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    });
    
    // Clear cookies
    const context = page.context();
    await context.clearCookies();
    
    console.log('Browser state cleared successfully');
  } catch (error) {
    console.warn('Failed to clear browser state:', error);
  }
}

/**
 * Wait for page to be fully loaded and interactive
 */
export async function waitForPageReady(page: Page, timeout: number = 10000): Promise<void> {
  try {
    // Wait for multiple load states
    await Promise.all([
      page.waitForLoadState('domcontentloaded', { timeout }),
      page.waitForLoadState('networkidle', { timeout: timeout / 2 }).catch(() => {
        // Network idle might not be reached, that's okay
        console.log('Network idle timeout reached, continuing...');
      })
    ]);
    
    // Wait for any Vue/React components to mount
    await page.waitForTimeout(500);
    
    console.log('Page ready state achieved');
  } catch (error) {
    console.warn('Page ready timeout:', error);
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Verify authentication state is properly loaded
 */
export async function verifyAuthState(page: Page): Promise<boolean> {
  try {
    // Check for authentication cookies or tokens
    const cookies = await page.context().cookies();
    const hasAuthCookies = cookies.some(cookie => 
      cookie.name.includes('auth') || 
      cookie.name.includes('session') ||
      cookie.name.includes('token') ||
      cookie.name.includes('supabase')
    );
    
    // Try to check localStorage for auth tokens, but handle security errors
    let hasAuthStorage = false;
    try {
      hasAuthStorage = await page.evaluate(() => {
        try {
          const keys = Object.keys(localStorage);
          return keys.some(key => 
            key.includes('auth') || 
            key.includes('session') ||
            key.includes('token') ||
            key.includes('supabase')
          );
        } catch (e) {
          // localStorage access denied
          return false;
        }
      });
    } catch (error) {
      console.log('localStorage access denied, checking cookies only');
      hasAuthStorage = false;
    }
    
    const isAuthenticated = hasAuthCookies || hasAuthStorage;
    console.log(`Authentication state check: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
    console.log(`Cookies found: ${hasAuthCookies}, Storage found: ${hasAuthStorage}`);
    
    return isAuthenticated;
  } catch (error) {
    console.warn('Failed to verify auth state:', error);
    return false;
  }
}

/**
 * Safe navigation with retry logic
 */
export async function safeNavigate(page: Page, url: string, timeout: number = 15000): Promise<void> {
  await retryOperation(async () => {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { timeout, waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`Navigation completed. Current URL: ${currentUrl}`);
  });
}

/**
 * Wait for element with retry logic
 */
export async function waitForElementSafely(
  page: Page, 
  selector: string, 
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch (error) {
    console.warn(`Element not found: ${selector}`);
    return false;
  }
} 