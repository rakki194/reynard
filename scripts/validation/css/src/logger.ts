/**
 * 🦊 CSS Variable Validator Logger
 * Provides colored console output for the CSS variable validation tool
 */

import type { ColorConfig, Logger } from "./types.js";

export class CSSLogger implements Logger {
  private colors: ColorConfig;
  private verboseMode: boolean;

  constructor(verbose = false) {
    this.verboseMode = verbose;
    this.colors = {
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      reset: "\x1b[0m",
      bold: "\x1b[1m",
    };
  }

  log(message: string, color?: keyof ColorConfig): void {
    if (color && this.colors[color]) {
      console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    } else {
      console.log(message);
    }
  }

  error(message: string): void {
    this.log(`❌ ${message}`, "red");
  }

  warn(message: string): void {
    this.log(`⚠️  ${message}`, "yellow");
  }

  info(message: string): void {
    this.log(`ℹ️  ${message}`, "blue");
  }

  success(message: string): void {
    this.log(`✅ ${message}`, "green");
  }

  section(title: string): void {
    this.log(`\n${this.colors.bold}${this.colors.cyan}${title}${this.colors.reset}`);
    this.log(`${"=".repeat(title.length)}`, "cyan");
  }

  verbose(message: string): void {
    if (this.verboseMode) {
      this.log(`🔍 ${message}`, "magenta");
    }
  }

  /**
   * Print a colored header for the tool
   */
  header(title: string): void {
    this.log(`\n${this.colors.bold}${this.colors.blue}${title}${this.colors.reset}`);
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
   * Print variable analysis information
   */
  variableInfo(variableName: string, count: number, type: "definition" | "usage"): void {
    if (!this.verboseMode) return;

    const icon = type === "definition" ? "📝" : "🔍";
    this.verbose(`  ${icon} ${variableName}: ${count} ${type}${count !== 1 ? "s" : ""}`);
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
}
