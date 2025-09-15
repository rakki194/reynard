/**
 * I18n Benchmark Helper Utilities
 *
 * 🦦 *splashes with testing precision* Comprehensive utilities for
 * i18n performance benchmarking and analysis.
 */

import { Page } from "@playwright/test";
import { BenchmarkConfig, PerformanceMetrics, defaultBenchmarkConfig } from "./i18n-benchmark-types";
import { I18nCacheUtils } from "./i18n-cache-utils";
import { I18nMemoryUtils } from "./i18n-memory-utils";
import { I18nReportingUtils } from "./i18n-reporting-utils";
import { I18nTestDataUtils } from "./i18n-test-data-utils";
import { I18nTranslationUtils } from "./i18n-translation-utils";

export class I18nBenchmarkHelper {
  private readonly config: BenchmarkConfig;
  private readonly memoryUtils: I18nMemoryUtils;
  private readonly translationUtils: I18nTranslationUtils;
  private readonly cacheUtils: I18nCacheUtils;
  private readonly testDataUtils: I18nTestDataUtils;
  private readonly reportingUtils: I18nReportingUtils;

  constructor(page: Page, config: BenchmarkConfig = defaultBenchmarkConfig) {
    this.config = config;
    this.memoryUtils = new I18nMemoryUtils(page);
    this.translationUtils = new I18nTranslationUtils(page);
    this.cacheUtils = new I18nCacheUtils(page);
    this.testDataUtils = new I18nTestDataUtils(page);
    this.reportingUtils = new I18nReportingUtils(config);
  }

  /**
   * Run comprehensive performance benchmark
   */
  async runComprehensiveBenchmark(): Promise<PerformanceMetrics> {
    const startMemory = await this.memoryUtils.getMemoryUsage();
    const startTime = performance.now();

    // Create test data
    await this.testDataUtils.createPerformanceTestData();

    // Measure translation loading
    const translationKeys = this.translationUtils.getCommonTranslationKeys().slice(0, 8);
    const renderTime = await this.translationUtils.measureTranslationLoad(translationKeys);

    // Measure language switching
    let languageSwitchTime = 0;
    if (this.config.testLanguages.length > 1) {
      languageSwitchTime = await this.translationUtils.measureLanguageSwitch(
        this.config.testLanguages[0],
        this.config.testLanguages[1]
      );
    }

    // Measure pluralization
    const pluralizationTime = await this.translationUtils.measurePluralization("en", 5);

    // Measure cache performance
    const cachePerformance = await this.cacheUtils.measureCachePerformance();

    const endTime = performance.now();
    const endMemory = await this.memoryUtils.getMemoryUsage();
    const bundleSize = await this.memoryUtils.getBundleSize();

    // Clean up
    await this.testDataUtils.cleanupTestData();

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
    this.reportingUtils.validatePerformance(metrics);
  }

  /**
   * Generate performance report
   */
  generateReport(metrics: PerformanceMetrics, testName: string): string {
    return this.reportingUtils.generateReport(metrics, testName);
  }

  /**
   * Get memory utilities for advanced usage
   */
  getMemoryUtils(): I18nMemoryUtils {
    return this.memoryUtils;
  }

  /**
   * Get translation utilities for advanced usage
   */
  getTranslationUtils(): I18nTranslationUtils {
    return this.translationUtils;
  }

  /**
   * Get cache utilities for advanced usage
   */
  getCacheUtils(): I18nCacheUtils {
    return this.cacheUtils;
  }

  /**
   * Get test data utilities for advanced usage
   */
  getTestDataUtils(): I18nTestDataUtils {
    return this.testDataUtils;
  }

  /**
   * Get reporting utilities for advanced usage
   */
  getReportingUtils(): I18nReportingUtils {
    return this.reportingUtils;
  }
}

// Re-export types and config for convenience
export { defaultBenchmarkConfig } from "./i18n-benchmark-types";
export type { BenchmarkConfig, PerformanceMetrics } from "./i18n-benchmark-types";
