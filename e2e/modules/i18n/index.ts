/**
 * I18n Testing Module - Barrel Export
 *
 * 🦦 *splashes with i18n testing enthusiasm* Clean exports for all
 * internationalization testing utilities in the Reynard e2e testing framework.
 */

// Core i18n benchmark utilities
export { I18nBenchmarkHelper } from "./i18n-benchmark-helpers";
export { defaultBenchmarkConfig } from "./i18n-benchmark-types";
export type { BenchmarkConfig, PerformanceMetrics } from "./i18n-benchmark-types";

// I18n utility classes
export { I18nCacheUtils } from "./i18n-cache-utils";
export { I18nMemoryUtils } from "./i18n-memory-utils";
export { I18nReportingUtils } from "./i18n-reporting-utils";
export { I18nTestDataUtils } from "./i18n-test-data-utils";
export { I18nTranslationUtils } from "./i18n-translation-utils";

// I18n file management
export { I18nFileManager } from "./i18n-file-manager";
export { I18nJsonGenerator } from "./i18n-json-generator";
export { I18nMarkdownGenerator } from "./i18n-markdown-generator";

// I18n performance analysis
export { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
export { I18nPerformanceReporter } from "./i18n-performance-reporter";
export type { I18nPerformanceTypes } from "./i18n-performance-types";

// I18n report generation
export { I18nReportGenerator } from "./i18n-report-generator";
export { I18nSectionGenerator } from "./i18n-section-generator";
export { I18nTableGenerator } from "./i18n-table-generator";
