/**
 * I18n Performance Types
 *
 * 🦦 *splashes with type precision* Type definitions for
 * i18n performance reporting and analysis.
 */

export type PerformanceGrade = "A" | "B" | "C" | "D" | "F";

export interface PerformanceResult {
  testName: string;
  approach: string;
  metrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    bundleSize?: number;
    languageSwitchTime?: number;
    pluralizationTime?: number;
    cacheHitRate?: number;
  };
  timestamp: Date;
  browser: string;
  iteration: number;
}

export interface BenchmarkSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageLoadTime: number;
  averageRenderTime: number;
  averageMemoryUsage: number;
  performanceGrade: PerformanceGrade;
  recommendations: string[];
}

export interface PerformanceThresholds {
  maxLoadTime: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxLanguageSwitchTime: number;
  maxPluralizationTime: number;
}

export const defaultPerformanceThresholds: PerformanceThresholds = {
  maxLoadTime: 1000,
  maxRenderTime: 100,
  maxMemoryUsage: 50 * 1024 * 1024,
  maxLanguageSwitchTime: 500,
  maxPluralizationTime: 50,
};
