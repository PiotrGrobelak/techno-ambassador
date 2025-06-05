import { chromium } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Start a browser to warm up and perform any global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the development server to be ready
    console.log('Waiting for development server...');
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:4321';
    
    // Check if server is responding
    let serverReady = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!serverReady && attempts < maxAttempts) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        serverReady = true;
        console.log('Development server is ready!');
      } catch (error) {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts}: Server not ready yet...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!serverReady) {
      throw new Error('Development server failed to start within expected time');
    }
    
    // Perform any global authentication or setup here
    // For example, create test users, seed database, etc.
    
  } finally {
    await browser.close();
  }
}

export default globalSetup; 