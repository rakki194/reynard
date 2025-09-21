#!/usr/bin/env node

/**
 * 🦊 CLI Interface for CSS Variable Validator
 * Command-line interface for the CSS variable validation tool
 */

import { Command } from "commander";
import { CSSVariableValidator } from "./CSSVariableValidator.js";
import type { ValidatorConfig, ReportOptions } from "./types.js";

interface CliOptions {
  verbose?: boolean;
  fix?: boolean;
  strict?: boolean;
  scanDirs?: string[];
  output?: string;
  format?: "markdown" | "json" | "text";
  detailed?: boolean;
  includePaths?: boolean;
  includeLineNumbers?: boolean;
  maxFiles?: string;
  include?: string[];
  exclude?: string[];
}

const program = new Command();

program
  .name("validate-css-variables")
  .description("🦊 Validate CSS variables across Reynard projects for consistency and correctness")
  .version("1.0.0");

program
  .option("-v, --verbose", "Enable verbose output")
  .option("--fix", "Enable automatic fixing mode (not implemented yet)")
  .option("--strict", "Fail on any inconsistencies (for CI/CD)")
  .option("--scan-dirs <dirs...>", "Directories to scan for CSS files", [
    "packages",
    "examples",
    "templates",
    "src",
    "styles",
  ])
  .option("-o, --output <path>", "Output file path for the report")
  .option("--format <format>", "Report format (markdown, json, text)", "markdown")
  .option("--detailed", "Include detailed metadata in report")
  .option("--include-paths", "Include file paths in report")
  .option("--include-line-numbers", "Include line numbers in report")
  .option("--max-files <number>", "Maximum number of files to process", "1000")
  .option("--include <patterns...>", "File patterns to include", ["*.css"])
  .option("--exclude <patterns...>", "File patterns to exclude", ["*.min.css", "*.bundle.css"])
  .action(async (options: CliOptions) => {
    try {
      // Build configuration
      const config: ValidatorConfig = {
        scanDirs: options.scanDirs || ["packages", "examples", "templates", "src", "styles"],
        criticalVariables: [
          "accent",
          "bg-color",
          "secondary-bg",
          "card-bg",
          "text-primary",
          "text-secondary",
          "text-tertiary",
          "border-color",
          "success",
          "error",
          "warning",
          "info",
          "danger",
        ],
        themeVariables: [
          "accent",
          "bg-color",
          "secondary-bg",
          "card-bg",
          "text-primary",
          "text-secondary",
          "border-color",
        ],
        verbose: options.verbose || false,
        fixMode: options.fix || false,
        strict: options.strict || false,
        ...(options.maxFiles && { maxFiles: parseInt(options.maxFiles, 10) }),
        ...(options.include && { includePatterns: options.include }),
        ...(options.exclude && { excludePatterns: options.exclude }),
      };

      // Build report options
      const reportOptions: ReportOptions = {
        format: options.format || "markdown",
        ...(options.output && { outputPath: options.output }),
        detailed: options.detailed || false,
        includePaths: options.includePaths || false,
        includeLineNumbers: options.includeLineNumbers || false,
      };

      // Create validator and run validation
      const validator = new CSSVariableValidator(config);
      const result = await validator.validate();

      // Generate and save report if output path is specified
      if (options.output) {
        const success = validator.saveReport(result, options.output, reportOptions);
        if (!success) {
          process.exit(1);
        }
      }

      // Exit with appropriate code
      const exitCode = validator.getExitCode(result);

      if (exitCode === 1) {
        console.error("\n❌ Validation failed with errors");
        process.exit(1);
      } else if (exitCode === 2) {
        console.warn("\n⚠️  Validation passed with warnings");
        if (options.strict) {
          process.exit(1);
        }
      } else {
        console.log("\n✅ Validation passed");
      }
    } catch (error) {
      console.error("❌ Error:", (error as Error).message);
      process.exit(1);
    }
  });

// Add help examples
program.addHelpText(
  "after",
  `
Examples:
  $ validate-css-variables
  $ validate-css-variables --verbose
  $ validate-css-variables --strict
  $ validate-css-variables --scan-dirs packages examples
  $ validate-css-variables --output report.md --format markdown
  $ validate-css-variables --include "*.css" --exclude "*.min.css"
  $ validate-css-variables --detailed --include-paths --include-line-numbers
`
);

program.parse();
