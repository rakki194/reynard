/**
 * 🔍 Animation Debug Tests
 * 
 * Specific tests to debug animation issues found in the demo
 */

import { test, expect, Page } from '@playwright/test';
import { createAnimationTester, AnimationConfigs } from './animation-helpers';

test.describe('Animation Debug Tests', () => {
  let page: Page;
  let animationTester: ReturnType<typeof createAnimationTester>;
  const DEMO_URL = 'http://[::1]:3005';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    animationTester = createAnimationTester(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Staggered Animation Debug', () => {
    test.beforeEach(async () => {
      await page.goto(DEMO_URL);
      // Navigate to staggered animations page
      await page.click('button:has-text("Staggered Animations")');
      await page.waitForTimeout(500); // Wait for navigation
    });

    test('should debug animation start process', async () => {
      // Monitor console logs during animation
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      });

      // Start animation and monitor
      await page.click('button:has-text("Start Animation")');
      
      // Wait for animation to process
      await page.waitForTimeout(1000);
      
      // Check animation status
      const animationStatus = await page.textContent('.status-value');
      console.log('Animation status shows "Yes":', animationStatus?.includes('Yes'));
      
      // Check first item progress
      const firstItemProgress = await page.textContent('.item-progress');
      console.log('First item progress:', firstItemProgress);
      
      // Log console messages
      console.log('Console logs during animation:');
      consoleLogs.forEach(log => console.log(log));
    });

    test('should debug animation system initialization', async () => {
      // Check if animation system is properly initialized by looking for UI elements
      const hasAnimationControls = await page.locator('button:has-text("Start Animation")').isVisible();
      const hasItems = await page.locator('.showcase-item').count();
      
      console.log('Has animation controls:', hasAnimationControls);
      console.log('Item count:', hasItems);
      
      if (!hasAnimationControls) {
        console.log('❌ Animation controls not found');
      } else {
        console.log('✅ Animation controls found');
      }
      
      if (hasItems === 0) {
        console.log('❌ No animation items found');
      } else {
        console.log('✅ Animation items found:', hasItems);
      }
    });

    test('should debug item visibility issue', async () => {
      // Check initial state of all items
      const items = page.locator('.showcase-item');
      const itemCount = await items.count();
      
      console.log('Found', itemCount, 'items');
      
      // Check if items are visible and have proper styling
      for (let i = 0; i < itemCount; i++) {
        const item = items.nth(i);
        const isVisible = await item.isVisible();
        const transform = await item.evaluate(el => getComputedStyle(el).transform);
        const opacity = await item.evaluate(el => getComputedStyle(el).opacity);
        
        console.log(`Item ${i + 1}: visible=${isVisible}, transform=${transform}, opacity=${opacity}`);
        
        if (!isVisible) {
          console.log(`❌ Item ${i + 1} is not visible`);
        } else if (transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)') {
          console.log(`❌ Item ${i + 1} has no transform`);
        } else {
          console.log(`✅ Item ${i + 1} has proper transform`);
        }
      }
    });

    test('should debug animation timing and delays', async () => {
      // Start animation
      await page.click('button:has-text("Start Animation")');
      
      // Monitor each item's animation start time
      const itemStartTimes: number[] = [];
      
      // Wait and check progress over time
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(100);
        
        const items = page.locator('.showcase-item');
        const itemCount = await items.count();
        
        for (let j = 0; j < itemCount; j++) {
          const item = items.nth(j);
          const progress = await item.textContent('.item-progress');
          const delay = await item.textContent('.item-delay');
          
          if (progress && progress.includes('%') && !progress.includes('0%')) {
            if (!itemStartTimes[j]) {
              itemStartTimes[j] = i * 100;
              console.log(`Item ${j + 1} started animating at ${itemStartTimes[j]}ms (delay: ${delay})`);
            }
          }
        }
      }
      
      console.log('Animation start times:', itemStartTimes);
    });

    test('should debug animation progress updates', async () => {
      // Start animation
      await page.click('button:has-text("Start Animation")');
      
      // Monitor progress updates
      const progressUpdates: { time: number; progress: string }[] = [];
      
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(100);
        
        const firstItem = page.locator('.showcase-item').first();
        const progress = await firstItem.textContent('.item-progress');
        
        if (progress) {
          progressUpdates.push({ time: i * 100, progress });
        }
      }
      
      console.log('Progress updates:');
      progressUpdates.forEach(update => {
        console.log(`${update.time}ms: ${update.progress}`);
      });
    });
  });

  test.describe('3D Animation Debug', () => {
    test.beforeEach(async () => {
      await page.goto(DEMO_URL);
      // Navigate to 3D animations page
      await page.click('button:has-text("3D Animations")');
      await page.waitForTimeout(500); // Wait for navigation
    });

    test('should debug 3D animation system availability', async () => {
      // Check if 3D animation system is available
      const has3DControls = await page.locator('button:has-text("Start Animation")').isVisible();
      const hasCanvas = await page.locator('canvas').isVisible();
      
      console.log('Has 3D controls:', has3DControls);
      console.log('Has canvas:', hasCanvas);
      
      if (!has3DControls) {
        console.log('❌ 3D Animation controls not found');
      } else {
        console.log('✅ 3D Animation controls found');
      }
      
      if (!hasCanvas) {
        console.log('❌ 3D Canvas not found');
      } else {
        console.log('✅ 3D Canvas found');
      }
    });

    test('should debug 3D animation execution', async () => {
      const animationTypes = ['rotation', 'cluster', 'particle'];
      
      for (const type of animationTypes) {
        console.log(`--- Testing ${type} animation ---`);
        
        // Select animation type
        await page.selectOption('select', type);
        
        // Start animation
        await page.click('button:has-text("Start Animation")');
        
        // Wait for animation to start
        await page.waitForTimeout(1000);
        
        // Check if animation is running
        const isAnimating = await page.textContent('.status-value');
        console.log(`${type} animation status:`, isAnimating);
        
        // Stop animation
        await page.click('button:has-text("Stop Animation")');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Animation Package Debug', () => {
    test('should debug animation package loading', async () => {
      await page.goto(DEMO_URL);
      // Navigate to staggered animations page
      await page.click('button:has-text("Staggered Animations")');
      await page.waitForTimeout(500); // Wait for navigation
      
      // Check if animation package is loaded by looking for actual functionality
      const hasStartButton = await page.locator('button:has-text("Start Animation")').isVisible();
      const hasControls = await page.locator('input[type="range"]').count();
      const hasItems = await page.locator('.showcase-item').count();
      
      console.log('Animation package functionality:');
      console.log('- Start button visible:', hasStartButton);
      console.log('- Control sliders count:', hasControls);
      console.log('- Animation items count:', hasItems);
      
      if (!hasStartButton) {
        console.log('❌ Start Animation button not found');
      } else {
        console.log('✅ Start Animation button found');
      }
      
      if (hasControls === 0) {
        console.log('❌ No animation controls found');
      } else {
        console.log('✅ Animation controls found:', hasControls);
      }
      
      if (hasItems === 0) {
        console.log('❌ No animation items found');
      } else {
        console.log('✅ Animation items found:', hasItems);
      }
    });

    test('should debug animation imports and dependencies', async () => {
      await page.goto(DEMO_URL);
      // Navigate to staggered animations page
      await page.click('button:has-text("Staggered Animations")');
      await page.waitForTimeout(500); // Wait for navigation
      
      // Check network requests for animation packages
      const networkRequests = await page.evaluate(() => {
        return (window as any).networkRequests || [];
      });
      
      console.log('Network requests:', networkRequests);
      
      if (networkRequests.length === 0) {
        console.log('✅ No import errors detected');
      } else {
        console.log('❌ Import errors detected:', networkRequests);
      }
    });
  });
});