/**
 * I18n Benchmark Helper Utilities
 * 
 * 🦦 *splashes with testing precision* Comprehensive utilities for
 * i18n performance benchmarking and analysis.
 */

import { Page, expect } from '@playwright/test';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize?: number;
  languageSwitchTime?: number;
  pluralizationTime?: number;
  cacheHitRate?: number;
}

export interface BenchmarkConfig {
  testLanguages: string[];
  testIterations: number;
  warmupIterations: number;
  performanceThresholds: {
    maxLoadTime: number;
    maxRenderTime: number;
    maxMemoryUsage: number;
    maxLanguageSwitchTime: number;
    maxPluralizationTime: number;
  };
}

export class I18nBenchmarkHelper {
  private page: Page;
  private config: BenchmarkConfig;

  constructor(page: Page, config: BenchmarkConfig) {
    this.page = page;
    this.config = config;
  }

  /**
   * Measure memory usage in bytes
   */
  async getMemoryUsage(): Promise<number> {
    return await this.page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
  }

  /**
   * Measure bundle size from network requests
   */
  async getBundleSize(): Promise<number> {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => 
          resource.name.includes('.js') || 
          resource.name.includes('.css') ||
          resource.name.includes('i18n') ||
          resource.name.includes('translation')
        )
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    });
  }

  /**
   * Measure translation loading performance
   */
  async measureTranslationLoad(translationKeys: string[]): Promise<number> {
    const startTime = performance.now();
    
    await this.page.evaluate((keys) => {
      // Simulate translation loading
      keys.forEach(key => {
        const elements = document.querySelectorAll(`[data-translation-key="${key}"]`);
        elements.forEach(el => {
          el.textContent = `Translated: ${key}`;
        });
      });
    }, translationKeys);
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure language switching performance
   */
  async measureLanguageSwitch(fromLang: string, toLang: string): Promise<number> {
    const startTime = performance.now();
    
    // Switch language
    await this.page.click(`[data-testid="language-selector"]`);
    await this.page.click(`[data-testid="language-${toLang}"]`);
    
    // Wait for translations to load
    await this.page.waitForSelector(`[data-testid="translated-content"]`, { timeout: 5000 });
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure pluralization performance
   */
  async measurePluralization(language: string, count: number): Promise<number> {
    const startTime = performance.now();
    
    await this.page.evaluate(({ lang, count }) => {
      // Simulate pluralization
      const pluralForm = `plural_${lang}_${count}`;
      const elements = document.querySelectorAll('[data-testid="pluralization-test"]');
      elements.forEach(el => {
        el.textContent = pluralForm;
      });
    }, { lang: language, count });
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure RTL layout switching performance
   */
  async measureRTLSwitch(language: string): Promise<number> {
    const startTime = performance.now();
    
    // Switch to RTL language
    await this.page.click(`[data-testid="language-selector"]`);
    await this.page.click(`[data-testid="language-${language}"]`);
    
    // Wait for RTL layout to apply
    await this.page.waitForSelector('[dir="rtl"]');
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure cache performance
   */
  async measureCachePerformance(): Promise<{ hitRate: number; loadTime: number }> {
    // First load (cache miss)
    const startTime1 = performance.now();
    await this.page.reload();
    await this.page.waitForSelector('[data-testid="translated-content"]');
    const endTime1 = performance.now();
    const cacheMissTime = endTime1 - startTime1;
    
    // Second load (cache hit)
    const startTime2 = performance.now();
    await this.page.reload();
    await this.page.waitForSelector('[data-testid="translated-content"]');
    const endTime2 = performance.now();
    const cacheHitTime = endTime2 - startTime2;
    
    const hitRate = cacheMissTime > 0 ? (cacheMissTime - cacheHitTime) / cacheMissTime : 0;
    
    return {
      hitRate: Math.max(0, Math.min(1, hitRate)),
      loadTime: cacheHitTime
    };
  }

  /**
   * Create performance test data
   */
  async createPerformanceTestData(): Promise<void> {
    await this.page.evaluate(() => {
      // Create test elements for benchmarking
      const testContainer = document.createElement('div');
      testContainer.id = 'i18n-benchmark-container';
      
      // Add hardcoded text elements
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        element.setAttribute('data-testid', 'hardcoded-text');
        element.textContent = `Hardcoded text ${i}`;
        testContainer.appendChild(element);
      }
      
      // Add translation key elements
      const translationKeys = [
        'common.loading', 'common.save', 'common.cancel', 'common.delete',
        'common.edit', 'common.close', 'common.confirm', 'common.error',
        'common.success', 'common.warning', 'common.info', 'common.help',
        'common.back', 'common.next', 'common.previous', 'common.finish',
        'common.start', 'common.stop', 'common.pause', 'common.resume'
      ];
      
      translationKeys.forEach(key => {
        const element = document.createElement('div');
        element.setAttribute('data-translation-key', key);
        element.setAttribute('data-testid', 'translated-content');
        element.textContent = `Translation: ${key}`;
        testContainer.appendChild(element);
      });
      
      // Add pluralization test elements
      for (let i = 0; i < 50; i++) {
        const element = document.createElement('div');
        element.setAttribute('data-testid', 'pluralization-test');
        element.textContent = `Pluralization test ${i}`;
        testContainer.appendChild(element);
      }
      
      document.body.appendChild(testContainer);
    });
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    await this.page.evaluate(() => {
      const container = document.getElementById('i18n-benchmark-container');
      if (container) {
        container.remove();
      }
    });
  }

  /**
   * Run comprehensive performance benchmark
   */
  async runComprehensiveBenchmark(): Promise<PerformanceMetrics> {
    const startMemory = await this.getMemoryUsage();
    const startTime = performance.now();
    
    // Create test data
    await this.createPerformanceTestData();
    
    // Measure translation loading
    const translationKeys = [
      'common.loading', 'common.save', 'common.cancel', 'common.delete',
      'common.edit', 'common.close', 'common.confirm', 'common.error'
    ];
    const renderTime = await this.measureTranslationLoad(translationKeys);
    
    // Measure language switching
    let languageSwitchTime = 0;
    if (this.config.testLanguages.length > 1) {
      languageSwitchTime = await this.measureLanguageSwitch(
        this.config.testLanguages[0],
        this.config.testLanguages[1]
      );
    }
    
    // Measure pluralization
    const pluralizationTime = await this.measurePluralization('en', 5);
    
    // Measure cache performance
    const cachePerformance = await this.measureCachePerformance();
    
    const endTime = performance.now();
    const endMemory = await this.getMemoryUsage();
    const bundleSize = await this.getBundleSize();
    
    // Clean up
    await this.cleanupTestData();
    
    return {
      loadTime: endTime - startTime,
      renderTime,
      memoryUsage: endMemory - startMemory,
      bundleSize,
      languageSwitchTime,
      pluralizationTime,
      cacheHitRate: cachePerformance.hitRate,
    };
  }

  /**
   * Validate performance thresholds
   */
  validatePerformance(metrics: PerformanceMetrics): void {
    expect(metrics.loadTime).toBeLessThan(this.config.performanceThresholds.maxLoadTime);
    expect(metrics.renderTime).toBeLessThan(this.config.performanceThresholds.maxRenderTime);
    expect(metrics.memoryUsage).toBeLessThan(this.config.performanceThresholds.maxMemoryUsage);
    
    if (metrics.languageSwitchTime) {
      expect(metrics.languageSwitchTime).toBeLessThan(this.config.performanceThresholds.maxLanguageSwitchTime);
    }
    
    if (metrics.pluralizationTime) {
      expect(metrics.pluralizationTime).toBeLessThan(this.config.performanceThresholds.maxPluralizationTime);
    }
  }

  /**
   * Generate performance report
   */
  generateReport(metrics: PerformanceMetrics, testName: string): string {
    return `
## ${testName} Performance Report

### Metrics
- **Load Time**: ${metrics.loadTime.toFixed(2)}ms
- **Render Time**: ${metrics.renderTime.toFixed(2)}ms
- **Memory Usage**: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
- **Bundle Size**: ${metrics.bundleSize ? (metrics.bundleSize / 1024).toFixed(2) + 'KB' : 'N/A'}
- **Language Switch Time**: ${metrics.languageSwitchTime?.toFixed(2) || 'N/A'}ms
- **Pluralization Time**: ${metrics.pluralizationTime?.toFixed(2) || 'N/A'}ms
- **Cache Hit Rate**: ${metrics.cacheHitRate ? (metrics.cacheHitRate * 100).toFixed(1) + '%' : 'N/A'}

### Thresholds
- Max Load Time: ${this.config.performanceThresholds.maxLoadTime}ms
- Max Render Time: ${this.config.performanceThresholds.maxRenderTime}ms
- Max Memory Usage: ${(this.config.performanceThresholds.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB
- Max Language Switch Time: ${this.config.performanceThresholds.maxLanguageSwitchTime}ms
- Max Pluralization Time: ${this.config.performanceThresholds.maxPluralizationTime}ms

### Status
${this.getPerformanceStatus(metrics)}
`;
  }

  private getPerformanceStatus(metrics: PerformanceMetrics): string {
    const issues: string[] = [];
    
    if (metrics.loadTime > this.config.performanceThresholds.maxLoadTime) {
      issues.push('❌ Load time exceeds threshold');
    }
    
    if (metrics.renderTime > this.config.performanceThresholds.maxRenderTime) {
      issues.push('❌ Render time exceeds threshold');
    }
    
    if (metrics.memoryUsage > this.config.performanceThresholds.maxMemoryUsage) {
      issues.push('❌ Memory usage exceeds threshold');
    }
    
    if (metrics.languageSwitchTime && metrics.languageSwitchTime > this.config.performanceThresholds.maxLanguageSwitchTime) {
      issues.push('❌ Language switch time exceeds threshold');
    }
    
    if (metrics.pluralizationTime && metrics.pluralizationTime > this.config.performanceThresholds.maxPluralizationTime) {
      issues.push('❌ Pluralization time exceeds threshold');
    }
    
    if (issues.length === 0) {
      return '✅ All performance metrics within acceptable thresholds';
    }
    
    return issues.join('\n');
  }
}

/**
 * Default benchmark configuration
 */
export const defaultBenchmarkConfig: BenchmarkConfig = {
  testLanguages: ['en', 'ja', 'fr', 'ru', 'zh', 'ar'],
  testIterations: 10,
  warmupIterations: 3,
  performanceThresholds: {
    maxLoadTime: 1000, // 1 second
    maxRenderTime: 100, // 100ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxLanguageSwitchTime: 500, // 500ms
    maxPluralizationTime: 50, // 50ms
  },
};
