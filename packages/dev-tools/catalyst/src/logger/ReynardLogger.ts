/**
 * ⚗️ Catalyst Reynard Logger
 * Unified logging system for all Reynard dev-tools
 */

import type { Logger, LoggerOptions, ColorConfig } from "../types/Logger.js";
import { DEFAULT_COLORS, createColorConfig } from "./ColorConfig.js";

export class ReynardLogger implements Logger {
  private readonly verboseMode: boolean;
  private readonly colors: ColorConfig;

  constructor(options: LoggerOptions = {}) {
    this.verboseMode = options.verbose || false;
    this.colors = createColorConfig(options.colors);
  }

  log(message: string, color: keyof ColorConfig = "reset"): void {
    if (color === "reset" || this.colors[color]) {
      console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    } else {
      console.log(message);
    }
  }

  info(message: string): void {
    this.log(`ℹ️  ${message}`, "blue");
  }

  warn(message: string): void {
    this.log(`⚠️  ${message}`, "yellow");
  }

  error(message: string): void {
    this.log(`❌ ${message}`, "red");
  }

  success(message: string): void {
    this.log(`✅ ${message}`, "green");
  }

  debug(message: string): void {
    if (this.verboseMode) {
      this.log(`🔍 ${message}`, "cyan");
    }
  }

  section(title: string): void {
    this.log("", "reset");
    this.log(`🎯 ${title}`, "magenta");
    this.log("=".repeat(30), "magenta");
  }

  header(title: string): void {
    this.log("", "reset");
    this.log(`${this.colors.bold}${this.colors.blue}${title}${this.colors.reset}`);
    this.log(`${"=".repeat(title.length)}`, "blue");
  }

  verbose(message: string): void {
    if (this.verboseMode) {
      this.log(`🔍 ${message}`, "magenta");
    }
  }

  /**
   * Print a colored header for the tool
   */
  toolHeader(title: string): void {
    this.log("", "reset");
    this.log(`${this.colors.bold}${this.colors.blue}${title}${this.colors.reset}`);
    this.log(`${"=".repeat(title.length)}`, "blue");
  }

  /**
   * Print a summary with statistics
   */
  summary(stats: Record<string, number>): void {
    this.section("📊 Summary");
    for (const [key, value] of Object.entries(stats)) {
      this.log(`  ${key}: ${value}`, "cyan");
    }
  }

  /**
   * Print file processing information
   */
  fileInfo(filePath: string, status: "processing" | "completed" | "error"): void {
    if (!this.verboseMode) return;

    const statusIcon = {
      processing: "🔄",
      completed: "✅",
      error: "❌",
    }[status];

    this.verbose(`${statusIcon} ${filePath}`);
  }

  /**
   * Print import resolution information
   */
  importInfo(originalPath: string, resolvedPath: string, exists: boolean): void {
    if (!this.verboseMode) return;

    const status = exists ? "✅" : "❌";
    this.verbose(`  ${status} ${originalPath} → ${resolvedPath}`);
  }

  /**
   * Print validation results
   */
  validationResults(results: { total: number; errors: number; warnings: number; success: boolean }): void {
    this.section("🎯 Validation Results");

    if (results.success) {
      this.success(`All validations passed! (${results.total} checks)`);
    } else {
      this.error(`Validation failed with ${results.errors} errors and ${results.warnings} warnings`);
    }

    this.log(`  Total checks: ${results.total}`, "blue");
    if (results.errors > 0) {
      this.log(`  Errors: ${results.errors}`, "red");
    }
    if (results.warnings > 0) {
      this.log(`  Warnings: ${results.warnings}`, "yellow");
    }
  }

  /**
   * Set verbose mode
   */
  setVerbose(verbose: boolean): void {
    (this as any).verboseMode = verbose;
  }

  /**
   * Get current verbose state
   */
  isVerbose(): boolean {
    return this.verboseMode;
  }
}
