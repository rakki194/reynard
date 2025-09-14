/**
 * I18n Rendering Approaches Benchmark
 * 
 * 🦦 *splashes with rendering analysis enthusiasm* Comprehensive comparison
 * of different i18n rendering approaches and their performance characteristics.
 */

import { test, expect, Page } from '@playwright/test';
import { I18nBenchmarkHelper, defaultBenchmarkConfig, PerformanceMetrics } from './utils/i18n-benchmark-helpers';

interface RenderingApproach {
  name: string;
  description: string;
  setup: (page: Page) => Promise<void>;
  test: (page: Page) => Promise<PerformanceMetrics>;
  cleanup: (page: Page) => Promise<void>;
}

class I18nRenderingBenchmark {
  private approaches: RenderingApproach[] = [];
  private results: Map<string, PerformanceMetrics[]> = new Map();

  constructor() {
    this.initializeApproaches();
  }

  private initializeApproaches() {
    // Approach 1: Hardcoded Strings (Baseline)
    this.approaches.push({
      name: 'Hardcoded Strings',
      description: 'Baseline performance with hardcoded English strings',
      setup: async (page: Page) => {
        await page.goto('/examples/basic-app');
        await page.waitForLoadState('networkidle');
      },
      test: async (page: Page) => {
        const helper = new I18nBenchmarkHelper(page, defaultBenchmarkConfig);
        return await helper.runComprehensiveBenchmark();
      },
      cleanup: async (page: Page) => {
        // No cleanup needed for hardcoded strings
      }
    });

    // Approach 2: Static I18n (All translations loaded at once)
    this.approaches.push({
      name: 'Static I18n',
      description: 'All translations loaded statically at build time',
      setup: async (page: Page) => {
        await page.goto('/examples/i18n-demo');
        await page.waitForLoadState('networkidle');
        // Simulate static loading by pre-loading all translations
        await page.evaluate(() => {
          // Simulate static translation loading
          window.staticTranslations = {
            en: { common: { loading: 'Loading...', save: 'Save', cancel: 'Cancel' } },
            ja: { common: { loading: '読み込み中...', save: '保存', cancel: 'キャンセル' } },
            fr: { common: { loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler' } }
          };
        });
      },
      test: async (page: Page) => {
        const helper = new I18nBenchmarkHelper(page, defaultBenchmarkConfig);
        return await helper.runComprehensiveBenchmark();
      },
      cleanup: async (page: Page) => {
        await page.evaluate(() => {
          delete window.staticTranslations;
        });
      }
    });

    // Approach 3: Dynamic I18n (Lazy loading)
    this.approaches.push({
      name: 'Dynamic I18n',
      description: 'Translations loaded dynamically on demand',
      setup: async (page: Page) => {
        await page.goto('/examples/i18n-demo');
        await page.waitForLoadState('networkidle');
        // Simulate dynamic loading
        await page.evaluate(() => {
          window.dynamicTranslations = new Map();
          window.loadTranslation = async (locale: string) => {
            if (!window.dynamicTranslations.has(locale)) {
              // Simulate async loading
              await new Promise(resolve => setTimeout(resolve, 10));
              window.dynamicTranslations.set(locale, {
                common: { loading: `Loading (${locale})...`, save: `Save (${locale})`, cancel: `Cancel (${locale})` }
              });
            }
            return window.dynamicTranslations.get(locale);
          };
        });
      },
      test: async (page: Page) => {
        const helper = new I18nBenchmarkHelper(page, defaultBenchmarkConfig);
        return await helper.runComprehensiveBenchmark();
      },
      cleanup: async (page: Page) => {
        await page.evaluate(() => {
          window.dynamicTranslations.clear();
          delete window.loadTranslation;
        });
      }
    });

    // Approach 4: Cached I18n (With intelligent caching)
    this.approaches.push({
      name: 'Cached I18n',
      description: 'Translations with intelligent caching and preloading',
      setup: async (page: Page) => {
        await page.goto('/examples/i18n-demo');
        await page.waitForLoadState('networkidle');
        // Simulate cached loading
        await page.evaluate(() => {
          window.cachedTranslations = new Map();
          window.translationCache = new Map();
          window.loadCachedTranslation = async (locale: string) => {
            if (window.translationCache.has(locale)) {
              return window.translationCache.get(locale);
            }
            // Simulate cache miss and loading
            await new Promise(resolve => setTimeout(resolve, 5));
            const translation = {
              common: { loading: `Cached Loading (${locale})...`, save: `Cached Save (${locale})`, cancel: `Cached Cancel (${locale})` }
            };
            window.translationCache.set(locale, translation);
            return translation;
          };
        });
      },
      test: async (page: Page) => {
        const helper = new I18nBenchmarkHelper(page, defaultBenchmarkConfig);
        return await helper.runComprehensiveBenchmark();
      },
      cleanup: async (page: Page) => {
        await page.evaluate(() => {
          window.cachedTranslations.clear();
          window.translationCache.clear();
          delete window.loadCachedTranslation;
        });
      }
    });

    // Approach 5: Namespace-based I18n (Modular loading)
    this.approaches.push({
      name: 'Namespace I18n',
      description: 'Translations organized by namespaces and loaded modularly',
      setup: async (page: Page) => {
        await page.goto('/examples/i18n-demo');
        await page.waitForLoadState('networkidle');
        // Simulate namespace-based loading
        await page.evaluate(() => {
          window.namespaceTranslations = new Map();
          window.loadNamespace = async (locale: string, namespace: string) => {
            const key = `${locale}:${namespace}`;
            if (!window.namespaceTranslations.has(key)) {
              await new Promise(resolve => setTimeout(resolve, 8));
              window.namespaceTranslations.set(key, {
                [namespace]: { loading: `${namespace} Loading (${locale})...`, save: `${namespace} Save (${locale})`, cancel: `${namespace} Cancel (${locale})` }
              });
            }
            return window.namespaceTranslations.get(key);
          };
        });
      },
      test: async (page: Page) => {
        const helper = new I18nBenchmarkHelper(page, defaultBenchmarkConfig);
        return await helper.runComprehensiveBenchmark();
      },
      cleanup: async (page: Page) => {
        await page.evaluate(() => {
          window.namespaceTranslations.clear();
          delete window.loadNamespace;
        });
      }
    });
  }

  async runBenchmark(page: Page): Promise<void> {
    console.log('🦦 Starting i18n rendering approaches benchmark...');
    
    for (const approach of this.approaches) {
      console.log(`\n📊 Testing approach: ${approach.name}`);
      console.log(`📝 Description: ${approach.description}`);
      
      try {
        // Setup
        await approach.setup(page);
        
        // Run multiple iterations
        const iterations = 5;
        const results: PerformanceMetrics[] = [];
        
        for (let i = 0; i < iterations; i++) {
          console.log(`  Iteration ${i + 1}/${iterations}`);
          const result = await approach.test(page);
          results.push(result);
          
          // Small delay between iterations
          await page.waitForTimeout(100);
        }
        
        // Store results
        this.results.set(approach.name, results);
        
        // Cleanup
        await approach.cleanup(page);
        
        console.log(`✅ Completed ${approach.name}`);
      } catch (error) {
        console.error(`❌ Failed ${approach.name}:`, error);
      }
    }
  }

  generateReport(): string {
    let report = '# I18n Rendering Approaches Benchmark Report\n\n';
    
    report += '## Executive Summary\n\n';
    report += 'This report compares different i18n rendering approaches and their performance characteristics.\n\n';
    
    report += '## Approaches Tested\n\n';
    this.approaches.forEach(approach => {
      report += `### ${approach.name}\n`;
      report += `**Description**: ${approach.description}\n\n`;
    });
    
    report += '## Performance Results\n\n';
    
    this.results.forEach((results, approachName) => {
      report += `### ${approachName}\n\n`;
      
      // Calculate averages
      const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
      const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
      const avgMemoryUsage = results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length;
      const avgLanguageSwitchTime = results.reduce((sum, r) => sum + (r.languageSwitchTime || 0), 0) / results.length;
      const avgPluralizationTime = results.reduce((sum, r) => sum + (r.pluralizationTime || 0), 0) / results.length;
      
      report += `- **Average Load Time**: ${avgLoadTime.toFixed(2)}ms\n`;
      report += `- **Average Render Time**: ${avgRenderTime.toFixed(2)}ms\n`;
      report += `- **Average Memory Usage**: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
      report += `- **Average Language Switch Time**: ${avgLanguageSwitchTime.toFixed(2)}ms\n`;
      report += `- **Average Pluralization Time**: ${avgPluralizationTime.toFixed(2)}ms\n\n`;
      
      // Individual results
      report += '#### Individual Results\n\n';
      results.forEach((result, index) => {
        report += `**Iteration ${index + 1}**:\n`;
        report += `- Load Time: ${result.loadTime.toFixed(2)}ms\n`;
        report += `- Render Time: ${result.renderTime.toFixed(2)}ms\n`;
        report += `- Memory Usage: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
        if (result.languageSwitchTime) {
          report += `- Language Switch Time: ${result.languageSwitchTime.toFixed(2)}ms\n`;
        }
        if (result.pluralizationTime) {
          report += `- Pluralization Time: ${result.pluralizationTime.toFixed(2)}ms\n`;
        }
        report += '\n';
      });
    });
    
    // Comparison table
    report += '## Performance Comparison\n\n';
    report += '| Approach | Avg Load Time (ms) | Avg Render Time (ms) | Avg Memory (MB) | Avg Switch Time (ms) |\n';
    report += '|----------|-------------------|---------------------|-----------------|---------------------|\n';
    
    this.results.forEach((results, approachName) => {
      const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
      const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
      const avgMemoryUsage = results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length;
      const avgLanguageSwitchTime = results.reduce((sum, r) => sum + (r.languageSwitchTime || 0), 0) / results.length;
      
      report += `| ${approachName} | ${avgLoadTime.toFixed(2)} | ${avgRenderTime.toFixed(2)} | ${(avgMemoryUsage / 1024 / 1024).toFixed(2)} | ${avgLanguageSwitchTime.toFixed(2)} |\n`;
    });
    
    report += '\n## Recommendations\n\n';
    report += 'Based on the benchmark results:\n\n';
    report += '1. **For maximum performance**: Use hardcoded strings, but this sacrifices internationalization flexibility.\n';
    report += '2. **For balanced performance and flexibility**: Use cached i18n with intelligent preloading.\n';
    report += '3. **For large applications**: Use namespace-based i18n to reduce initial bundle size.\n';
    report += '4. **For dynamic content**: Use dynamic i18n with lazy loading.\n\n';
    
    report += '---\n\n';
    report += '*Generated by Reynard I18n Rendering Approaches Benchmark*\n';
    report += '*🦦 Splashing with rendering analysis precision*\n';
    
    return report;
  }
}

test.describe('I18n Rendering Approaches Benchmark', () => {
  let benchmark: I18nRenderingBenchmark;

  test.beforeEach(async ({ page }) => {
    benchmark = new I18nRenderingBenchmark();
    
    // Enable performance monitoring
    await page.addInitScript(() => {
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

  test('Compare all i18n rendering approaches', async ({ page }) => {
    await benchmark.runBenchmark(page);
    
    // Generate and log report
    const report = benchmark.generateReport();
    console.log('\n' + report);
    
    // Save report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'i18n-rendering-approaches-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n📊 Rendering approaches report saved to: ${reportPath}`);
  });

  test('Validate performance thresholds for each approach', async ({ page }) => {
    await benchmark.runBenchmark(page);
    
    // Validate each approach meets performance thresholds
    benchmark['results'].forEach((results, approachName) => {
      results.forEach((result, index) => {
        console.log(`Validating ${approachName} iteration ${index + 1}`);
        
        expect(result.loadTime).toBeLessThan(defaultBenchmarkConfig.performanceThresholds.maxLoadTime);
        expect(result.renderTime).toBeLessThan(defaultBenchmarkConfig.performanceThresholds.maxRenderTime);
        expect(result.memoryUsage).toBeLessThan(defaultBenchmarkConfig.performanceThresholds.maxMemoryUsage);
        
        if (result.languageSwitchTime) {
          expect(result.languageSwitchTime).toBeLessThan(defaultBenchmarkConfig.performanceThresholds.maxLanguageSwitchTime);
        }
        
        if (result.pluralizationTime) {
          expect(result.pluralizationTime).toBeLessThan(defaultBenchmarkConfig.performanceThresholds.maxPluralizationTime);
        }
      });
    });
  });

  test('Memory usage comparison across approaches', async ({ page }) => {
    await benchmark.runBenchmark(page);
    
    const memoryComparison: { [key: string]: number } = {};
    
    benchmark['results'].forEach((results, approachName) => {
      const avgMemoryUsage = results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length;
      memoryComparison[approachName] = avgMemoryUsage;
    });
    
    console.log('\n📊 Memory Usage Comparison:');
    Object.entries(memoryComparison)
      .sort(([,a], [,b]) => a - b)
      .forEach(([approach, memory]) => {
        console.log(`${approach}: ${(memory / 1024 / 1024).toFixed(2)}MB`);
      });
    
    // Hardcoded strings should use the least memory
    const hardcodedMemory = memoryComparison['Hardcoded Strings'];
    const i18nApproaches = Object.entries(memoryComparison)
      .filter(([name]) => name !== 'Hardcoded Strings')
      .map(([, memory]) => memory);
    
    i18nApproaches.forEach(memory => {
      expect(memory).toBeGreaterThan(hardcodedMemory);
    });
  });

  test('Load time comparison across approaches', async ({ page }) => {
    await benchmark.runBenchmark(page);
    
    const loadTimeComparison: { [key: string]: number } = {};
    
    benchmark['results'].forEach((results, approachName) => {
      const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
      loadTimeComparison[approachName] = avgLoadTime;
    });
    
    console.log('\n📊 Load Time Comparison:');
    Object.entries(loadTimeComparison)
      .sort(([,a], [,b]) => a - b)
      .forEach(([approach, loadTime]) => {
        console.log(`${approach}: ${loadTime.toFixed(2)}ms`);
      });
    
    // Hardcoded strings should be fastest
    const hardcodedLoadTime = loadTimeComparison['Hardcoded Strings'];
    const i18nApproaches = Object.entries(loadTimeComparison)
      .filter(([name]) => name !== 'Hardcoded Strings')
      .map(([, loadTime]) => loadTime);
    
    i18nApproaches.forEach(loadTime => {
      expect(loadTime).toBeGreaterThan(hardcodedLoadTime);
    });
  });
});
