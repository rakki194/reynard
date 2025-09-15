/**
 * I18n Benchmark Types and Interfaces
 *
 * 🦦 *splashes with type precision* Type definitions for
 * i18n performance benchmarking and analysis.
 */

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

export interface CachePerformanceResult {
  hitRate: number;
  loadTime: number;
}

/**
 * Default benchmark configuration
 */
export const defaultBenchmarkConfig: BenchmarkConfig = {
  testLanguages: ["en", "ja", "fr", "ru", "zh", "ar"],
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
