/**
 * 🐺 Report Generator Module
 * Handles generation of summary reports and statistics
 */

import type { ReynardLogger } from "reynard-dev-tools-catalyst";

export class ReportGenerator {
  constructor(private logger: ReynardLogger) {}

  /**
   * Generate summary report
   */
  generateSummary(total: number, valid: number, invalid: number, fixesApplied: number): void {
    this.logger.section("Summary Report");
    this.logger.log(`📊 Total shell scripts found: ${total}`, "blue");
    this.logger.log(`✅ Valid scripts: ${valid}`, "green");
    this.logger.log(`❌ Invalid scripts: ${invalid}`, invalid > 0 ? "red" : "green");
    this.logger.log(`🔧 Fixes applied: ${fixesApplied}`, "yellow");

    if (invalid > 0) {
      this.logger.log("", "reset");
      this.logger.log("🔧 To fix issues:", "yellow");
      this.logger.log("  1. Run with --fix flag to auto-fix common issues", "yellow");
      this.logger.log("  2. Manually fix remaining issues in workflow files", "yellow");
      this.logger.log("  3. Use shellcheck directly for detailed analysis", "yellow");
    } else {
      this.logger.log("", "reset");
      this.logger.log("🎉 All workflow shell scripts are valid!", "green");
    }
  }

  /**
   * Generate processing start message
   */
  generateStartMessage(): void {
    this.logger.log("🐺 Starting workflow shell script extraction and validation...", "magenta");
    this.logger.log("=".repeat(60), "magenta");
  }

  /**
   * Generate workflow files found message
   */
  generateWorkflowFilesMessage(count: number): void {
    this.logger.log(`📊 Found ${count} workflow files`, "blue");
  }

  /**
   * Generate no workflow files error
   */
  generateNoWorkflowFilesError(): void {
    this.logger.error("No workflow files found");
  }
}
