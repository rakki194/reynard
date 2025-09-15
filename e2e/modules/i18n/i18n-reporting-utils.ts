/**
 * I18n Performance Reporting and Validation Utilities
 *
 * 🦦 *splashes with reporting precision* Utilities for generating
 * performance reports and validating benchmark results.
 */

import { expect } from "@playwright/test";
import { BenchmarkConfig, PerformanceMetrics } from "./i18n-benchmark-types";

export class I18nReportingUtils {
  private readonly config: BenchmarkConfig;

  constructor(config: BenchmarkConfig) {
    this.config = config;
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
- **Bundle Size**: ${metrics.bundleSize ? (metrics.bundleSize / 1024).toFixed(2) + "KB" : "N/A"}
- **Language Switch Time**: ${metrics.languageSwitchTime?.toFixed(2) || "N/A"}ms
- **Pluralization Time**: ${metrics.pluralizationTime?.toFixed(2) || "N/A"}ms
- **Cache Hit Rate**: ${metrics.cacheHitRate ? (metrics.cacheHitRate * 100).toFixed(1) + "%" : "N/A"}

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

  /**
   * Get performance status summary
   */
  getPerformanceStatus(metrics: PerformanceMetrics): string {
    const issues: string[] = [];

    if (metrics.loadTime > this.config.performanceThresholds.maxLoadTime) {
      issues.push("❌ Load time exceeds threshold");
    }

    if (metrics.renderTime > this.config.performanceThresholds.maxRenderTime) {
      issues.push("❌ Render time exceeds threshold");
    }

    if (metrics.memoryUsage > this.config.performanceThresholds.maxMemoryUsage) {
      issues.push("❌ Memory usage exceeds threshold");
    }

    if (
      metrics.languageSwitchTime &&
      metrics.languageSwitchTime > this.config.performanceThresholds.maxLanguageSwitchTime
    ) {
      issues.push("❌ Language switch time exceeds threshold");
    }

    if (
      metrics.pluralizationTime &&
      metrics.pluralizationTime > this.config.performanceThresholds.maxPluralizationTime
    ) {
      issues.push("❌ Pluralization time exceeds threshold");
    }

    if (issues.length === 0) {
      return "✅ All performance metrics within acceptable thresholds";
    }

    return issues.join("\n");
  }

  /**
   * Generate JSON report for programmatic use
   */
  generateJsonReport(metrics: PerformanceMetrics, testName: string): object {
    return {
      testName,
      timestamp: new Date().toISOString(),
      metrics,
      thresholds: this.config.performanceThresholds,
      status: this.getPerformanceStatus(metrics),
      passed: this.getPerformanceStatus(metrics).includes("✅"),
    };
  }

  /**
   * Format time duration for display
   */
  formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(2)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }
}
