/**
 * Global Setup for I18n Performance Benchmarking
 * 
 * 🦦 *splashes with setup enthusiasm* Prepares the environment for
 * comprehensive i18n performance benchmarking.
 */

import { chromium, FullConfig } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🦦 Setting up i18n performance benchmarking environment...');
  
  // Create results directory
  const resultsDir = join(__dirname, 'i18n-benchmark-results');
  mkdirSync(resultsDir, { recursive: true });
  
  // Initialize performance monitoring
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Enable performance monitoring
  await page.addInitScript(() => {
    // Enable performance observer
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
        }
      });
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint', 'resource'] });
    }
    
    // Enable memory monitoring
    if (performance.memory) {
      setInterval(() => {
        console.log(`Memory: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }, 1000);
    }
  });
  
  // Test basic i18n functionality
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="language-selector"]', { timeout: 10000 });
    console.log('✅ I18n demo app is accessible');
  } catch (error) {
    console.warn('⚠️ I18n demo app not accessible, some tests may fail');
  }
  
  // Test basic app functionality
  try {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    console.log('✅ Basic app is accessible');
  } catch (error) {
    console.warn('⚠️ Basic app not accessible, some tests may fail');
  }
  
  await browser.close();
  
  // Create benchmark configuration file
  const benchmarkConfig = {
    startTime: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    testConfig: {
      browsers: ['chromium', 'firefox', 'webkit'],
      languages: ['en', 'ja', 'fr', 'ru', 'zh', 'ar'],
      iterations: 10,
      warmupIterations: 3,
    },
    thresholds: {
      maxLoadTime: 1000,
      maxRenderTime: 100,
      maxMemoryUsage: 50 * 1024 * 1024,
      maxLanguageSwitchTime: 500,
      maxPluralizationTime: 50,
    },
  };
  
  writeFileSync(
    join(resultsDir, 'benchmark-config.json'),
    JSON.stringify(benchmarkConfig, null, 2)
  );
  
  console.log('🦦 I18n benchmarking environment setup complete!');
}

export default globalSetup;
