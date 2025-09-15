/**
 * I18n Performance Reporter
 *
 * 🦦 *splashes with reporting precision* Comprehensive reporting utilities
 * for i18n performance benchmark results.
 */

import { I18nFileManager } from "./i18n-file-manager";
import { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
import { BenchmarkSummary, PerformanceResult } from "./i18n-performance-types";
import { I18nReportGenerator } from "./i18n-report-generator";

export class I18nPerformanceReporter {
  private results: PerformanceResult[] = [];
  private readonly analyzer: I18nPerformanceAnalyzer;
  private readonly reportGenerator: I18nReportGenerator;
  private readonly fileManager: I18nFileManager;

  constructor(outputDir: string = "i18n-benchmark-results") {
    this.analyzer = new I18nPerformanceAnalyzer();
    this.reportGenerator = new I18nReportGenerator(this.analyzer);
    this.fileManager = new I18nFileManager(outputDir);
  }

  /**
   * Add a single performance result
   */
  addResult(result: PerformanceResult): void {
    this.results.push(result);
  }

  /**
   * Add multiple performance results
   */
  addResults(results: PerformanceResult[]): void {
    this.results.push(...results);
  }

  /**
   * Generate benchmark summary
   */
  generateSummary(): BenchmarkSummary {
    return this.analyzer.generateSummary(this.results);
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(): string {
    return this.reportGenerator.generateMarkdownReport(this.results);
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(): string {
    return this.reportGenerator.generateJSONReport(this.results);
  }

  /**
   * Save reports to files
   */
  saveReports(): void {
    const markdownReport = this.generateMarkdownReport();
    const jsonReport = this.generateJSONReport();
    this.fileManager.saveReports(markdownReport, jsonReport);
  }

  /**
   * Get all results
   */
  getResults(): PerformanceResult[] {
    return this.results;
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Get the performance analyzer for advanced usage
   */
  getAnalyzer(): I18nPerformanceAnalyzer {
    return this.analyzer;
  }

  /**
   * Get the report generator for advanced usage
   */
  getReportGenerator(): I18nReportGenerator {
    return this.reportGenerator;
  }

  /**
   * Get the file manager for advanced usage
   */
  getFileManager(): I18nFileManager {
    return this.fileManager;
  }
}

// Re-export types and classes for convenience
export { I18nFileManager } from "./i18n-file-manager";
export { I18nJsonGenerator } from "./i18n-json-generator";
export { I18nMarkdownGenerator } from "./i18n-markdown-generator";
export { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
export type { BenchmarkSummary, PerformanceGrade, PerformanceResult } from "./i18n-performance-types";
export { I18nReportGenerator } from "./i18n-report-generator";
export { I18nSectionGenerator } from "./i18n-section-generator";
export { I18nTableGenerator } from "./i18n-table-generator";
