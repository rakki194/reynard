/**
 * I18n Report Generator
 *
 * 🦦 *splashes with report precision* Utilities for generating
 * comprehensive performance reports in various formats.
 */

import { I18nJsonGenerator } from "./i18n-json-generator";
import { I18nMarkdownGenerator } from "./i18n-markdown-generator";
import { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
import { PerformanceResult } from "./i18n-performance-types";

export class I18nReportGenerator {
  private readonly analyzer: I18nPerformanceAnalyzer;
  private readonly markdownGenerator: I18nMarkdownGenerator;
  private readonly jsonGenerator: I18nJsonGenerator;

  constructor(analyzer: I18nPerformanceAnalyzer) {
    this.analyzer = analyzer;
    this.markdownGenerator = new I18nMarkdownGenerator(analyzer);
    this.jsonGenerator = new I18nJsonGenerator(analyzer);
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(results: PerformanceResult[]): string {
    return this.markdownGenerator.generateMarkdownReport(results);
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(results: PerformanceResult[]): string {
    return this.jsonGenerator.generateJSONReport(results);
  }

  /**
   * Get the markdown generator for advanced usage
   */
  getMarkdownGenerator(): I18nMarkdownGenerator {
    return this.markdownGenerator;
  }

  /**
   * Get the JSON generator for advanced usage
   */
  getJsonGenerator(): I18nJsonGenerator {
    return this.jsonGenerator;
  }
}
