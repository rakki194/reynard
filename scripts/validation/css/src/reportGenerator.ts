/**
 * 🦊 CSS Variable Report Generator
 * Generates comprehensive reports for CSS variable validation results
 */

import fs from "fs";
import path from "path";
import type { ValidationResult, ReportOptions } from "./types.js";
import { CSSLogger } from "./logger.js";

export class ReportGenerator {
  private logger: CSSLogger;

  constructor(logger: CSSLogger) {
    this.logger = logger;
  }

  /**
   * Generate a comprehensive report
   */
  generateReport(result: ValidationResult, options: ReportOptions = { format: "markdown" }): string {
    switch (options.format) {
      case "markdown":
        return this.generateMarkdownReport(result, options);
      case "json":
        return this.generateJsonReport(result);
      case "text":
        return this.generateTextReport(result);
      default:
        return this.generateMarkdownReport(result, options);
    }
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(result: ValidationResult, options: ReportOptions): string {
    const report: string[] = [];

    report.push("# CSS Variable Validation Report");
    report.push("=".repeat(50));
    report.push("");

    // Summary
    report.push("## Summary");
    report.push(`- **Total Variable Definitions**: ${result.summary.totalDefinitions}`);
    report.push(`  - Direct definitions: ${result.summary.directDefinitions}`);
    report.push(`  - Imported definitions: ${result.summary.importedDefinitions}`);
    report.push(`- **Total Variable Usage**: ${result.summary.totalUsage}`);
    report.push(`  - Direct usage: ${result.summary.directUsage}`);
    report.push(`  - Imported usage: ${result.summary.importedUsage}`);
    report.push(`- **Unique Variables**: ${result.summary.uniqueVariables}`);
    report.push(`- **Missing Variables**: ${result.summary.missingVariables}`);
    report.push(`- **Unused Variables**: ${result.summary.unusedVariables}`);
    report.push(`- **Potential Typos**: ${result.summary.typos}`);
    report.push("");

    // Validation status
    report.push("## Validation Status");
    if (result.success) {
      report.push("✅ **All validations passed!**");
    } else {
      report.push("❌ **Validation failed with errors**");
    }
    report.push("");

    // Issues by severity
    const errors = result.issues.filter(i => i.severity === "error");
    const warnings = result.issues.filter(i => i.severity === "warning");
    // const _info = result.issues.filter(i => i.severity === "info");

    if (errors.length > 0) {
      report.push("## ❌ Errors");
      for (const error of errors) {
        report.push(`### \`--${error.variable}\``);
        report.push(`- **Message**: ${error.message}`);
        if (error.context) {
          report.push(`- **Context**: ${error.context}`);
        }
        if (error.file && options.includePaths) {
          report.push(`- **File**: ${error.file}`);
        }
        if (error.line && options.includeLineNumbers) {
          report.push(`- **Line**: ${error.line}`);
        }
        if (error.fix) {
          report.push(`- **Suggested Fix**: ${error.fix}`);
        }
        report.push("");
      }
    }

    if (warnings.length > 0) {
      report.push("## ⚠️ Warnings");
      for (const warning of warnings) {
        report.push(`### \`--${warning.variable}\``);
        report.push(`- **Message**: ${warning.message}`);
        if (warning.context) {
          report.push(`- **Context**: ${warning.context}`);
        }
        if (warning.file && options.includePaths) {
          report.push(`- **File**: ${warning.file}`);
        }
        if (warning.line && options.includeLineNumbers) {
          report.push(`- **Line**: ${warning.line}`);
        }
        if (warning.fix) {
          report.push(`- **Suggested Fix**: ${warning.fix}`);
        }
        report.push("");
      }
    }

    // Missing variables
    if (result.missingVariables.length > 0) {
      report.push("## Missing Variable Definitions");
      for (const missing of result.missingVariables) {
        report.push(`### ❌ \`--${missing.variable}\``);
        report.push(`- **Usage Count**: ${missing.usageCount}`);
        if (options.includePaths) {
          report.push(`- **Files**: ${missing.files.join(", ")}`);
        }
        if (missing.importContext && missing.importContext.length > 0) {
          report.push(`- **Import Context**: Used in files that import from:`);
          for (const source of missing.importContext) {
            report.push(`  - ${source}`);
          }
        }
        report.push("");
      }
    }

    // Unused variables
    if (result.unusedVariables.length > 0) {
      report.push("## Unused Variable Definitions");
      for (const unused of result.unusedVariables) {
        report.push(`### ⚠️ \`--${unused.variable}\``);
        report.push(`- **Definition Count**: ${unused.definitionCount}`);
        if (options.includePaths) {
          report.push(`- **Files**: ${unused.files.join(", ")}`);
        }
        report.push("");
      }
    }

    // Typos
    if (result.typos.length > 0) {
      report.push("## Potential Typos");
      for (const typo of result.typos) {
        report.push(`### ⚠️ \`--${typo.variable}\``);
        for (const issue of typo.issues) {
          report.push(`- ${issue}`);
        }
        if (typo.suggestions && typo.suggestions.length > 0) {
          report.push(`- **Suggestions**: ${typo.suggestions.join(", ")}`);
        }
        report.push("");
      }
    }

    // Metadata
    if (options.detailed) {
      report.push("## Metadata");
      report.push(`- **Validation Duration**: ${result.metadata.duration}ms`);
      report.push(`- **Project Root**: ${result.metadata.projectRoot}`);
      report.push(`- **Scan Directories**: ${result.metadata.scanDirs.join(", ")}`);
      report.push(`- **Start Time**: ${result.metadata.startTime.toISOString()}`);
      report.push(`- **End Time**: ${result.metadata.endTime.toISOString()}`);
      report.push("");
    }

    return report.join("\n");
  }

  /**
   * Generate JSON report
   */
  private generateJsonReport(result: ValidationResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Generate text report
   */
  private generateTextReport(result: ValidationResult): string {
    const report: string[] = [];

    report.push("CSS Variable Validation Report");
    report.push("=".repeat(50));
    report.push("");

    // Summary
    report.push("Summary:");
    report.push(`  Total Variable Definitions: ${result.summary.totalDefinitions}`);
    report.push(`  Total Variable Usage: ${result.summary.totalUsage}`);
    report.push(`  Unique Variables: ${result.summary.uniqueVariables}`);
    report.push(`  Missing Variables: ${result.summary.missingVariables}`);
    report.push(`  Unused Variables: ${result.summary.unusedVariables}`);
    report.push(`  Potential Typos: ${result.summary.typos}`);
    report.push("");

    // Status
    if (result.success) {
      report.push("Status: PASSED");
    } else {
      report.push("Status: FAILED");
    }
    report.push("");

    // Issues
    if (result.issues.length > 0) {
      report.push("Issues:");
      for (const issue of result.issues) {
        const severity = issue.severity.toUpperCase();
        report.push(`  [${severity}] --${issue.variable}: ${issue.message}`);
        if (issue.context) {
          report.push(`    Context: ${issue.context}`);
        }
        if (issue.fix) {
          report.push(`    Fix: ${issue.fix}`);
        }
      }
    }

    return report.join("\n");
  }

  /**
   * Save report to file
   */
  saveReport(report: string, outputPath: string): boolean {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, report, "utf-8");
      this.logger.success(`Report saved to: ${outputPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Could not save report to ${outputPath}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Generate a quick summary for console output
   */
  generateQuickSummary(result: ValidationResult): string {
    const summary: string[] = [];

    summary.push(`📊 CSS Variable Validation Summary:`);
    summary.push(
      `  Variables: ${result.summary.uniqueVariables} unique, ${result.summary.totalDefinitions} definitions, ${result.summary.totalUsage} usages`
    );

    if (result.summary.missingVariables > 0) {
      summary.push(`  ❌ Missing: ${result.summary.missingVariables}`);
    }
    if (result.summary.unusedVariables > 0) {
      summary.push(`  ⚠️  Unused: ${result.summary.unusedVariables}`);
    }
    if (result.summary.typos > 0) {
      summary.push(`  🔤 Typos: ${result.summary.typos}`);
    }

    if (result.success) {
      summary.push(`  ✅ Status: PASSED`);
    } else {
      summary.push(`  ❌ Status: FAILED`);
    }

    return summary.join("\n");
  }
}
