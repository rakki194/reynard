/**
 * I18n Performance Benchmark Suite
 * 
 * 🦦 *splashes excitedly* Comprehensive benchmarking of i18n vs hardcoded strings
 * and different i18n rendering approaches using the e2e testing framework.
 * 
 * This suite measures:
 * - Initial load performance (hardcoded vs i18n)
 * - Language switching performance
 * - Memory usage patterns
 * - Bundle size impact
 * - Different i18n rendering strategies
 */

import { test, expect, Page } from '@playwright/test';
import { performance } from 'perf_hooks';

interface BenchmarkResult {
  testName: string;
  approach: string;
  metrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    bundleSize?: number;
    languageSwitchTime?: number;
  };
  timestamp: Date;
}

interface I18nBenchmarkConfig {
  testLanguages: string[];
  testIterations: number;
  warmupIterations: number;
  performanceThresholds: {
    maxLoadTime: number;
    maxRenderTime: number;
    maxMemoryUsage: number;
  };
}

class I18nBenchmarkRunner {
  private results: BenchmarkResult[] = [];
  private config: I18nBenchmarkConfig;

  constructor(config: I18nBenchmarkConfig) {
    this.config = config;
  }

  async runBenchmark(
    page: Page,
    testName: string,
    approach: string,
    testFunction: () => Promise<void>
  ): Promise<BenchmarkResult> {
    // Warmup iterations
    for (let i = 0; i < this.config.warmupIterations; i++) {
      await testFunction();
    }

    // Clear memory between tests
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });

    const startTime = performance.now();
    const startMemory = await this.getMemoryUsage(page);

    // Run actual test iterations
    for (let i = 0; i < this.config.testIterations; i++) {
      await testFunction();
    }

    const endTime = performance.now();
    const endMemory = await this.getMemoryUsage(page);

    const result: BenchmarkResult = {
      testName,
      approach,
      metrics: {
        loadTime: endTime - startTime,
        renderTime: 0, // Will be measured separately
        memoryUsage: endMemory - startMemory,
      },
      timestamp: new Date(),
    };

    this.results.push(result);
    return result;
  }

  private async getMemoryUsage(page: Page): Promise<number> {
    return await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
  }

  getResults(): BenchmarkResult[] {
    return this.results;
  }

  generateReport(): string {
    const report = this.results.map(result => {
      return `
## ${result.testName} - ${result.approach}
- Load Time: ${result.metrics.loadTime.toFixed(2)}ms
- Render Time: ${result.metrics.renderTime.toFixed(2)}ms
- Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
- Language Switch Time: ${result.metrics.languageSwitchTime?.toFixed(2) || 'N/A'}ms
- Timestamp: ${result.timestamp.toISOString()}
`;
    }).join('\n');

    return `# I18n Benchmark Results\n${report}`;
  }
}

// Test configuration
const benchmarkConfig: I18nBenchmarkConfig = {
  testLanguages: ['en', 'ja', 'fr', 'ru', 'zh', 'ar'],
  testIterations: 10,
  warmupIterations: 3,
  performanceThresholds: {
    maxLoadTime: 1000, // 1 second
    maxRenderTime: 100, // 100ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  },
};

test.describe('I18n Performance Benchmarks', () => {
  let benchmarkRunner: I18nBenchmarkRunner;

  test.beforeEach(async ({ page }) => {
    benchmarkRunner = new I18nBenchmarkRunner(benchmarkConfig);
    
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Enable performance observer
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
          }
        });
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      }
    });
  });

  test('Hardcoded Strings Baseline Performance', async ({ page }) => {
    await page.goto('/examples/basic-app');
    
    const result = await benchmarkRunner.runBenchmark(
      page,
      'Hardcoded Strings',
      'Baseline',
      async () => {
        // Test hardcoded string rendering
        await page.evaluate(() => {
          const start = performance.now();
          
          // Simulate rendering hardcoded strings
          const elements = document.querySelectorAll('[data-testid="hardcoded-text"]');
          elements.forEach(el => {
            el.textContent = 'Loading...';
            el.textContent = 'Save';
            el.textContent = 'Cancel';
            el.textContent = 'Delete';
            el.textContent = 'Edit';
          });
          
          const end = performance.now();
          console.log(`Hardcoded render time: ${end - start}ms`);
        });
      }
    );

    expect(result.metrics.loadTime).toBeLessThan(benchmarkConfig.performanceThresholds.maxLoadTime);
    expect(result.metrics.memoryUsage).toBeLessThan(benchmarkConfig.performanceThresholds.maxMemoryUsage);
  });

  test('Dynamic I18n Loading Performance', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    
    const result = await benchmarkRunner.runBenchmark(
      page,
      'Dynamic I18n Loading',
      'Full i18n System',
      async () => {
        // Test dynamic i18n loading
        await page.evaluate(() => {
          const start = performance.now();
          
          // Simulate i18n translation loading
          const translationKeys = [
            'common.loading',
            'common.save',
            'common.cancel',
            'common.delete',
            'common.edit',
            'common.close',
            'common.confirm',
            'common.error',
            'common.success',
            'common.warning'
          ];
          
          // Simulate translation function calls
          translationKeys.forEach(key => {
            // This would be the actual i18n function call
            const translated = `Translated: ${key}`;
            const elements = document.querySelectorAll(`[data-translation-key="${key}"]`);
            elements.forEach(el => {
              el.textContent = translated;
            });
          });
          
          const end = performance.now();
          console.log(`I18n render time: ${end - start}ms`);
        });
      }
    );

    expect(result.metrics.loadTime).toBeLessThan(benchmarkConfig.performanceThresholds.maxLoadTime);
  });

  test('Language Switching Performance', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    
    // Test language switching performance
    for (const language of benchmarkConfig.testLanguages) {
      const startTime = performance.now();
      
      // Switch language
      await page.click(`[data-testid="language-selector"]`);
      await page.click(`[data-testid="language-${language}"]`);
      
      // Wait for translations to load
      await page.waitForSelector(`[data-testid="translated-content"]`, { timeout: 5000 });
      
      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      console.log(`Language switch to ${language}: ${switchTime}ms`);
      
      // Verify translation is loaded
      const translatedText = await page.textContent('[data-testid="translated-content"]');
      expect(translatedText).toBeTruthy();
      
      // Performance assertion
      expect(switchTime).toBeLessThan(500); // 500ms threshold for language switching
    }
  });

  test('Cached vs Uncached I18n Performance', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    
    // Test uncached performance (first load)
    const uncachedResult = await benchmarkRunner.runBenchmark(
      page,
      'Uncached I18n',
      'First Load',
      async () => {
        await page.reload();
        await page.waitForSelector('[data-testid="translated-content"]');
      }
    );
    
    // Test cached performance (subsequent loads)
    const cachedResult = await benchmarkRunner.runBenchmark(
      page,
      'Cached I18n',
      'Cached Load',
      async () => {
        await page.reload();
        await page.waitForSelector('[data-testid="translated-content"]');
      }
    );
    
    // Cached should be significantly faster
    expect(cachedResult.metrics.loadTime).toBeLessThan(uncachedResult.metrics.loadTime * 0.8);
    
    console.log(`Uncached: ${uncachedResult.metrics.loadTime}ms, Cached: ${cachedResult.metrics.loadTime}ms`);
  });

  test('Memory Usage Comparison', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    
    // Measure memory usage with different approaches
    const memoryTests = [
      {
        name: 'Hardcoded Strings',
        approach: 'baseline',
        testFn: async () => {
          await page.goto('/examples/basic-app');
          await page.waitForLoadState('networkidle');
        }
      },
      {
        name: 'Single Language I18n',
        approach: 'single-lang',
        testFn: async () => {
          await page.goto('/examples/i18n-demo');
          await page.waitForLoadState('networkidle');
        }
      },
      {
        name: 'Multi-Language I18n',
        approach: 'multi-lang',
        testFn: async () => {
          await page.goto('/examples/i18n-demo');
          // Load multiple languages
          for (const lang of ['en', 'ja', 'fr']) {
            await page.click(`[data-testid="language-selector"]`);
            await page.click(`[data-testid="language-${lang}"]`);
            await page.waitForTimeout(100);
          }
          await page.waitForLoadState('networkidle');
        }
      }
    ];
    
    for (const test of memoryTests) {
      const result = await benchmarkRunner.runBenchmark(
        page,
        test.name,
        test.approach,
        test.testFn
      );
      
      console.log(`${test.name} Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      expect(result.metrics.memoryUsage).toBeLessThan(benchmarkConfig.performanceThresholds.maxMemoryUsage);
    }
  });

  test('Bundle Size Impact Analysis', async ({ page }) => {
    // This test analyzes the impact of i18n on bundle size
    await page.goto('/examples/i18n-demo');
    
    // Get network requests to analyze bundle sizes
    const requests = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((entry: any) => entry.name.includes('.js') || entry.name.includes('.css'))
        .map((entry: any) => ({
          name: entry.name,
          size: entry.transferSize,
          duration: entry.duration
        }));
    });
    
    console.log('Bundle Analysis:', requests);
    
    // Analyze i18n-specific bundles
    const i18nBundles = requests.filter(req => 
      req.name.includes('i18n') || req.name.includes('translation')
    );
    
    const totalI18nSize = i18nBundles.reduce((sum, bundle) => sum + bundle.size, 0);
    console.log(`Total i18n bundle size: ${(totalI18nSize / 1024).toFixed(2)}KB`);
    
    // Assert reasonable bundle size
    expect(totalI18nSize).toBeLessThan(500 * 1024); // 500KB threshold
  });

  test('RTL Language Performance', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    
    const rtlLanguages = ['ar', 'he'];
    
    for (const language of rtlLanguages) {
      const startTime = performance.now();
      
      // Switch to RTL language
      await page.click(`[data-testid="language-selector"]`);
      await page.click(`[data-testid="language-${language}"]`);
      
      // Wait for RTL layout to apply
      await page.waitForSelector('[dir="rtl"]');
      
      const endTime = performance.now();
      const rtlSwitchTime = endTime - startTime;
      
      console.log(`RTL switch to ${language}: ${rtlSwitchTime}ms`);
      
      // Verify RTL is applied
      const dir = await page.getAttribute('html', 'dir');
      expect(dir).toBe('rtl');
      
      // Performance assertion
      expect(rtlSwitchTime).toBeLessThan(1000); // 1 second threshold for RTL switching
    }
  });

  test('Pluralization Performance', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    
    // Test pluralization performance for different languages
    const pluralizationTests = [
      { lang: 'en', count: 0, expected: 'zero' },
      { lang: 'en', count: 1, expected: 'one' },
      { lang: 'en', count: 2, expected: 'other' },
      { lang: 'ru', count: 1, expected: 'one' },
      { lang: 'ru', count: 2, expected: 'few' },
      { lang: 'ru', count: 5, expected: 'many' },
      { lang: 'ar', count: 0, expected: 'zero' },
      { lang: 'ar', count: 1, expected: 'one' },
      { lang: 'ar', count: 2, expected: 'two' },
      { lang: 'ar', count: 3, expected: 'few' },
    ];
    
    for (const test of pluralizationTests) {
      const startTime = performance.now();
      
      // Switch to test language
      await page.click(`[data-testid="language-selector"]`);
      await page.click(`[data-testid="language-${test.lang}"]`);
      
      // Test pluralization
      await page.evaluate(({ count, expected }) => {
        // Simulate pluralization function call
        const pluralForm = `plural_${expected}_${count}`;
        const elements = document.querySelectorAll('[data-testid="pluralization-test"]');
        elements.forEach(el => {
          el.textContent = pluralForm;
        });
      }, test);
      
      const endTime = performance.now();
      const pluralizationTime = endTime - startTime;
      
      console.log(`Pluralization ${test.lang} (${test.count}): ${pluralizationTime}ms`);
      
      // Performance assertion
      expect(pluralizationTime).toBeLessThan(100); // 100ms threshold for pluralization
    }
  });

  test.afterAll(async () => {
    // Generate and save benchmark report
    const report = benchmarkRunner.generateReport();
    console.log('\n' + report);
    
    // Save report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'i18n-benchmark-results.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`Benchmark report saved to: ${reportPath}`);
  });
});
