/**
 * 🎭 Animation Global Setup
 * 
 * Global setup for animation E2E tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Setting up animation test environment...');
  
  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for animation demo to be ready
    console.log('⏳ Waiting for animation demo to start...');
    await page.goto('http://[::1]:3005', { waitUntil: 'networkidle' });
    
    // Verify demo is working
    const title = await page.title();
    if (!title.includes('Animation System Demo')) {
      throw new Error('Animation demo not properly loaded');
    }
    
    console.log('✅ Animation demo is ready');
    
    // Test basic functionality
    await page.goto('http://localhost:3005/staggered');
    await page.waitForLoadState('networkidle');
    
    // Check if animation system is available
    const systemReady = await page.evaluate(() => {
      // Check if the animation system is properly loaded
      return typeof (window as any).useStaggeredAnimation === 'function' ||
             document.querySelector('.showcase-item') !== null;
    });
    
    if (!systemReady) {
      throw new Error('Animation system not properly initialized');
    }
    
    console.log('✅ Animation system is ready');
    
  } catch (error) {
    console.error('❌ Animation setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎭 Animation test environment setup complete');
}

export default globalSetup;
