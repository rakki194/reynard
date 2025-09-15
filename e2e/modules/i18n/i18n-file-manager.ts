/**
 * I18n File Manager
 *
 * 🦦 *splashes with file precision* Utilities for managing
 * performance report files and output directories.
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export class I18nFileManager {
  private readonly outputDir: string;

  constructor(outputDir: string = "i18n-benchmark-results") {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    mkdirSync(this.outputDir, { recursive: true });
  }

  /**
   * Save report to file
   */
  private saveReport(content: string, filename: string): string {
    const filePath = join(this.outputDir, filename);
    writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * Save markdown report to file
   */
  saveMarkdownReport(content: string, filename: string = "i18n-performance-report.md"): string {
    return this.saveReport(content, filename);
  }

  /**
   * Save JSON report to file
   */
  saveJSONReport(content: string, filename: string = "i18n-performance-report.json"): string {
    return this.saveReport(content, filename);
  }

  /**
   * Save both markdown and JSON reports
   */
  saveReports(markdownContent: string, jsonContent: string): { markdownPath: string; jsonPath: string } {
    const markdownPath = this.saveMarkdownReport(markdownContent);
    const jsonPath = this.saveJSONReport(jsonContent);

    console.log(`📊 Performance reports saved:`);
    console.log(`  Markdown: ${markdownPath}`);
    console.log(`  JSON: ${jsonPath}`);

    return { markdownPath, jsonPath };
  }

  /**
   * Get output directory path
   */
  getOutputDir(): string {
    return this.outputDir;
  }
}
