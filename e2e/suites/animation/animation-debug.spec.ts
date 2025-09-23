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
  const DEMO_URL = 'http://localhost:3005';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    animationTester = createAnimationTester(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Staggered Animation Debug', () => {
    test.beforeEach(async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      await page.waitForLoadState('networkidle');
    });

    test('should debug item visibility issue', async () => {
      // Check initial state of all items
      const items = page.locator('.showcase-item');
      const itemCount = await items.count();
      
      console.log(`Found ${itemCount} items`);
      
      for (let i = 0; i < itemCount; i++) {
        const item = items.nth(i);
        
        // Check if item is visible
        const isVisible = await item.isVisible();
        console.log(`Item ${i + 1} visible: ${isVisible}`);
        
        // Check computed styles
        const styles = await item.evaluate(el => {
          const computed = getComputedStyle(el);
          return {
            transform: computed.transform,
            opacity: computed.opacity,
            display: computed.display,
            visibility: computed.visibility,
            width: computed.width,
            height: computed.height
          };
        });
        
        console.log(`Item ${i + 1} styles:`, styles);
        
        // Check if transform scale is 0 (invisible)
        if (styles.transform.includes('matrix(0, 0, 0, 0, 0, 0)')) {
          console.log(`❌ Item ${i + 1} has scale(0) - INVISIBLE!`);
        } else {
          console.log(`✅ Item ${i + 1} has proper scale`);
        }
      }
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

    test('should debug animation start process', async () => {
      // Monitor console logs during animation
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'warn' || msg.type() === 'error') {
          consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      
      // Start animation and monitor
      await page.click('button:has-text("Start Animation")');
      
      // Wait for animation to process
      await page.waitForTimeout(1000);
      
      console.log('Console logs during animation:');
      consoleLogs.forEach(log => console.log(log));
      
      // Check if animation actually started
      const isAnimating = await page.locator('.status-value:has-text("Yes")').isVisible();
      console.log('Animation status shows "Yes":', isAnimating);
      
      // Check if items are being updated
      const items = page.locator('.showcase-item');
      const firstItem = items.first();
      const progressText = await firstItem.locator('.item-progress').textContent();
      console.log('First item progress:', progressText);
    });

    test('should debug animation timing and delays', async () => {
      // Start animation
      await page.click('button:has-text("Start Animation")');
      
      // Monitor each item's animation start time
      const itemStartTimes: number[] = [];
      const items = page.locator('.showcase-item');
      
      for (let i = 0; i < 5; i++) {
        const item = items.nth(i);
        const startTime = Date.now();
        
        // Wait for item to start animating (opacity or transform change)
        try {
          await page.waitForFunction(
            (index) => {
              const items = document.querySelectorAll('.showcase-item');
              const item = items[index];
              if (!item) return false;
              
              const style = getComputedStyle(item);
              const transform = style.transform;
              const opacity = parseFloat(style.opacity);
              
              // Check if animation has started
              return transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)' ||
                     opacity !== 1;
            },
            i,
            { timeout: 2000 }
          );
          
          const actualStartTime = Date.now();
          itemStartTimes.push(actualStartTime - startTime);
          console.log(`Item ${i + 1} started animating after ${actualStartTime - startTime}ms`);
        } catch (error) {
          console.log(`❌ Item ${i + 1} never started animating`);
          itemStartTimes.push(-1);
        }
      }
      
      // Check if delays are working
      const expectedDelays = [0, 50, 100, 150, 200]; // Based on stagger config
      for (let i = 0; i < itemStartTimes.length; i++) {
        if (itemStartTimes[i] !== -1) {
          const expectedDelay = expectedDelays[i];
          const actualDelay = itemStartTimes[i];
          const difference = Math.abs(actualDelay - expectedDelay);
          
          console.log(`Item ${i + 1}: Expected ${expectedDelay}ms, got ${actualDelay}ms, diff: ${difference}ms`);
          
          if (difference > 100) {
            console.log(`❌ Item ${i + 1} delay is off by ${difference}ms`);
          } else {
            console.log(`✅ Item ${i + 1} delay is within tolerance`);
          }
        }
      }
    });

    test('should debug animation progress updates', async () => {
      // Start animation
      await page.click('button:has-text("Start Animation")');
      
      // Monitor progress updates
      const progressUpdates: { time: number; progress: string }[] = [];
      
      // Set up progress monitoring
      await page.evaluate(() => {
        const items = document.querySelectorAll('.showcase-item');
        items.forEach((item, index) => {
          const progressElement = item.querySelector('.item-progress');
          if (progressElement) {
            const observer = new MutationObserver(() => {
              (window as any).progressUpdates = (window as any).progressUpdates || [];
              (window as any).progressUpdates.push({
                time: Date.now(),
                index,
                progress: progressElement.textContent
              });
            });
            observer.observe(progressElement, { childList: true, subtree: true, characterData: true });
          }
        });
      });
      
      // Wait for animation to run
      await page.waitForTimeout(2000);
      
      // Get progress updates
      const updates = await page.evaluate(() => (window as any).progressUpdates || []);
      
      console.log('Progress updates:', updates);
      
      // Check if progress is actually updating
      const hasProgressUpdates = updates.length > 0;
      console.log('Has progress updates:', hasProgressUpdates);
      
      if (!hasProgressUpdates) {
        console.log('❌ No progress updates detected - animation system may not be working');
      } else {
        console.log('✅ Progress updates detected');
      }
    });
  });

  test.describe('3D Animation Debug', () => {
    test.beforeEach(async () => {
      await page.goto(`${DEMO_URL}/3d`);
      await page.waitForLoadState('networkidle');
    });

    test('should debug 3D animation system availability', async () => {
      // Check if 3D animation system is available
      const systemState = await page.evaluate(() => {
        const threeDAnimation = (window as any).threeDAnimation;
        if (threeDAnimation) {
          return {
            isSystemAvailable: threeDAnimation.isSystemAvailable(),
            animationEngine: threeDAnimation.animationEngine(),
            state: threeDAnimation.state()
          };
        }
        return { systemAvailable: false };
      });
      
      console.log('3D Animation system state:', systemState);
      
      if (!systemState.systemAvailable) {
        console.log('❌ 3D Animation system not available');
      } else {
        console.log('✅ 3D Animation system available');
        console.log('Engine:', systemState.animationEngine);
        console.log('State:', systemState.state);
      }
    });

    test('should debug 3D animation execution', async () => {
      // Monitor console logs
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'warn' || msg.type() === 'error') {
          consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      
      // Try different animation types
      const animationTypes = ['rotation', 'cluster', 'particles'];
      
      for (const type of animationTypes) {
        console.log(`\n--- Testing ${type} animation ---`);
        
        // Select animation type
        await page.selectOption('select', type);
        
        // Start animation
        await page.click('button:has-text("Start Animation")');
        
        // Wait for animation to process
        await page.waitForTimeout(1000);
        
        // Check status
        const isAnimating = await page.locator('.status-value:has-text("Yes")').isVisible();
        console.log(`${type} animation status:`, isAnimating);
        
        // Check state updates
        const state = await page.evaluate(() => {
          const threeDAnimation = (window as any).threeDAnimation;
          if (threeDAnimation) {
            return threeDAnimation.state();
          }
          return null;
        });
        
        console.log(`${type} animation state:`, state);
      }
      
      console.log('\nConsole logs:');
      consoleLogs.forEach(log => console.log(log));
    });
  });

  test.describe('Animation Package Debug', () => {
    test('should debug animation package loading', async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      
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
      await page.goto(`${DEMO_URL}/staggered`);
      
      // Check network requests for animation packages
      const networkRequests = await page.evaluate(() => {
        return (window as any).networkRequests || [];
      });
      
      console.log('Network requests:', networkRequests);
      
      // Check for failed imports
      const importErrors = await page.evaluate(() => {
        const errors: string[] = [];
        
        // Check for module loading errors
        if ((window as any).moduleErrors) {
          errors.push(...(window as any).moduleErrors);
        }
        
        return errors;
      });
      
      if (importErrors.length > 0) {
        console.log('❌ Import errors detected:');
        importErrors.forEach((error: string) => console.log(error));
      } else {
        console.log('✅ No import errors detected');
      }
    });
  });
});
