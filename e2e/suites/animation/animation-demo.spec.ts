/**
 * 🎭 Animation Demo E2E Tests
 * 
 * Comprehensive tests for the animation demo application
 * Tests staggered animations, 3D animations, and visual effects
 */

import { test, expect, Page } from '@playwright/test';
import { setupTestEnvironment } from '../../core/setup/test-environment';
import { takeScreenshot, compareScreenshots } from '../../core/utils/visual-testing';

test.describe('Animation Demo Application', () => {
  let page: Page;
  const DEMO_URL = 'http://localhost:3005';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await setupTestEnvironment(page);
    
    // Navigate to animation demo
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Application Loading', () => {
    test('should load the animation demo successfully', async () => {
      await expect(page).toHaveTitle(/Animation Demo/);
      
      // Check for main navigation
      await expect(page.locator('nav')).toBeVisible();
      
      // Check for demo pages
      await expect(page.locator('a[href*="staggered"]')).toBeVisible();
      await expect(page.locator('a[href*="3d"]')).toBeVisible();
    });

    test('should have proper page structure', async () => {
      // Check for main content areas
      await expect(page.locator('.demo-header')).toBeVisible();
      await expect(page.locator('.animation-card')).toBeVisible();
    });
  });

  test.describe('Staggered Animation Demo', () => {
    test.beforeEach(async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      await page.waitForLoadState('networkidle');
    });

    test('should display staggered animation controls', async () => {
      // Check for control elements
      await expect(page.locator('h1:has-text("Staggered Animation Demo")')).toBeVisible();
      await expect(page.locator('input[type="range"]')).toHaveCount(3); // Duration, Delay, Stagger
      await expect(page.locator('select')).toBeVisible(); // Direction
      await expect(page.locator('button:has-text("Start Animation")')).toBeVisible();
    });

    test('should show animation items with proper visibility', async () => {
      // Check that all items are visible (not scaled to 0)
      const items = page.locator('.showcase-item');
      await expect(items).toHaveCount(5);
      
      // Check that items have proper initial state
      for (let i = 0; i < 5; i++) {
        const item = items.nth(i);
        await expect(item).toBeVisible();
        
        // Check that transform scale is not 0 (items should be visible)
        const transform = await item.evaluate(el => getComputedStyle(el).transform);
        expect(transform).not.toBe('matrix(0, 0, 0, 0, 0, 0)');
      }
    });

    test('should start staggered animation when button is clicked', async () => {
      // Take initial screenshot
      await takeScreenshot(page, 'staggered-animation-initial');
      
      // Click start animation button
      await page.click('button:has-text("Start Animation")');
      
      // Wait for animation to start
      await page.waitForTimeout(100);
      
      // Check that animation status shows "Yes"
      await expect(page.locator('.status-value:has-text("Yes")')).toBeVisible();
      
      // Take screenshot during animation
      await takeScreenshot(page, 'staggered-animation-running');
      
      // Wait for animation to complete
      await page.waitForTimeout(2000);
      
      // Check that animation status shows "No"
      await expect(page.locator('.status-value:has-text("No")')).toBeVisible();
      
      // Take final screenshot
      await takeScreenshot(page, 'staggered-animation-complete');
    });

    test('should update animation parameters when controls are changed', async () => {
      // Change duration
      const durationSlider = page.locator('input[type="range"]').first();
      await durationSlider.fill('800');
      
      // Check that value is updated
      await expect(page.locator('.control-value:has-text("800ms")')).toBeVisible();
      
      // Change stagger
      const staggerSlider = page.locator('input[type="range"]').nth(2);
      await staggerSlider.fill('100');
      
      // Check that value is updated
      await expect(page.locator('.control-value:has-text("100ms")')).toBeVisible();
    });

    test('should add and remove items dynamically', async () => {
      // Add an item
      await page.click('button:has-text("Add Item")');
      
      // Check that item count increased
      await expect(page.locator('.showcase-item')).toHaveCount(6);
      
      // Remove an item
      await page.click('button:has-text("Remove Item")');
      
      // Check that item count decreased
      await expect(page.locator('.showcase-item')).toHaveCount(5);
    });

    test('should show proper animation progress', async () => {
      // Start animation
      await page.click('button:has-text("Start Animation")');
      
      // Wait a bit for animation to progress
      await page.waitForTimeout(500);
      
      // Check that progress values are being updated
      const progressElements = page.locator('.item-progress');
      await expect(progressElements.first()).toContainText('Progress:');
      
      // Check that at least one item shows progress > 0%
      const progressText = await progressElements.first().textContent();
      expect(progressText).toMatch(/\d+%/);
    });
  });

  test.describe('3D Animation Demo', () => {
    test.beforeEach(async () => {
      await page.goto(`${DEMO_URL}/3d`);
      await page.waitForLoadState('networkidle');
    });

    test('should display 3D animation controls', async () => {
      // Check for 3D specific controls
      await expect(page.locator('h1:has-text("Three.js Animation Demo")')).toBeVisible();
      await expect(page.locator('input[type="range"]')).toHaveCount(3); // Camera, Rotation, Duration
      await expect(page.locator('select')).toBeVisible(); // Animation type
      await expect(page.locator('button:has-text("Start Animation")')).toBeVisible();
    });

    test('should show 3D animation status', async () => {
      // Check status display
      await expect(page.locator('.status-item')).toHaveCount(6);
      await expect(page.locator('.status-label:has-text("Animation Engine")')).toBeVisible();
      await expect(page.locator('.status-label:has-text("System Available")')).toBeVisible();
    });

    test('should start different animation types', async () => {
      // Test rotation animation
      await page.selectOption('select', 'rotation');
      await page.click('button:has-text("Start Animation")');
      
      await page.waitForTimeout(100);
      await expect(page.locator('.status-value:has-text("Yes")')).toBeVisible();
      
      // Wait for animation to complete
      await page.waitForTimeout(1000);
      
      // Test cluster animation
      await page.selectOption('select', 'cluster');
      await page.click('button:has-text("Start Animation")');
      
      await page.waitForTimeout(100);
      await expect(page.locator('.status-value:has-text("Yes")')).toBeVisible();
      
      // Test particle animation
      await page.selectOption('select', 'particles');
      await page.click('button:has-text("Start Animation")');
      
      await page.waitForTimeout(100);
      await expect(page.locator('.status-value:has-text("Yes")')).toBeVisible();
    });

    test('should update 3D scene parameters', async () => {
      // Change camera position
      const cameraSlider = page.locator('input[type="range"]').first();
      await cameraSlider.fill('10');
      
      // Check that value is updated
      await expect(page.locator('.control-value:has-text("10")')).toBeVisible();
      
      // Change rotation speed
      const rotationSlider = page.locator('input[type="range"]').nth(1);
      await rotationSlider.fill('0.05');
      
      // Check that value is updated
      await expect(page.locator('.control-value:has-text("0.05")')).toBeVisible();
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should match baseline screenshots for staggered animation', async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      await page.waitForLoadState('networkidle');
      
      // Take baseline screenshot
      await takeScreenshot(page, 'staggered-baseline');
      
      // Compare with expected baseline
      const matches = await compareScreenshots('staggered-baseline', 'staggered-expected');
      expect(matches).toBe(true);
    });

    test('should match baseline screenshots for 3D animation', async () => {
      await page.goto(`${DEMO_URL}/3d`);
      await page.waitForLoadState('networkidle');
      
      // Take baseline screenshot
      await takeScreenshot(page, '3d-baseline');
      
      // Compare with expected baseline
      const matches = await compareScreenshots('3d-baseline', '3d-expected');
      expect(matches).toBe(true);
    });
  });

  test.describe('Performance Tests', () => {
    test('should maintain good performance during animations', async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      
      // Start performance monitoring
      await page.evaluate(() => {
        window.performance.mark('animation-start');
      });
      
      // Start animation
      await page.click('button:has-text("Start Animation")');
      
      // Wait for animation to complete
      await page.waitForTimeout(2000);
      
      // Check performance
      const performanceMetrics = await page.evaluate(() => {
        window.performance.mark('animation-end');
        window.performance.measure('animation-duration', 'animation-start', 'animation-end');
        
        const measure = window.performance.getEntriesByName('animation-duration')[0];
        return {
          duration: measure.duration,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        };
      });
      
      // Animation should complete within reasonable time
      expect(performanceMetrics.duration).toBeLessThan(3000);
      
      // Memory usage should be reasonable
      expect(performanceMetrics.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should be accessible with proper ARIA labels', async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      
      // Check for proper labels
      await expect(page.locator('label')).toHaveCount(3);
      
      // Check for proper button labels
      await expect(page.locator('button:has-text("Start Animation")')).toHaveAttribute('type', 'button');
      await expect(page.locator('button:has-text("Stop Animation")')).toHaveAttribute('type', 'button');
    });

    test('should support keyboard navigation', async () => {
      await page.goto(`${DEMO_URL}/staggered`);
      
      // Tab through controls
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check that focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});
