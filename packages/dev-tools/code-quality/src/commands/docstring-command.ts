/**
 * Reynard Docstring Validation Command
 *
 * Comprehensive CLI command for analyzing docstring coverage and quality
 * across the Reynard codebase. Provides detailed metrics, coverage analysis,
 * and quality assessment for Python and TypeScript documentation standards.
 */

import { Command } from "commander";
import { handleDocstringAction } from "./docstring-action-handler";

export function createDocstringCommand(): Command {
  const command = new Command("docstring");

  command
    .description("🦦 Analyze docstring coverage and quality")
    .option("-p, --path <path>", "Path to analyze (default: current directory)", ".")
    .option("-f, --format <format>", "Output format (table, json, summary)", "table")
    .option("--min-coverage <percentage>", "Minimum coverage percentage threshold", "80")
    .option("--min-quality <score>", "Minimum quality score threshold", "70")
    .option("--include-files <pattern>", "Include files matching pattern (glob)", "**/*.{py,ts,tsx}")
    .option(
      "--exclude-files <pattern>",
      "Exclude files matching pattern (glob)",
      "**/node_modules/**,**/dist/**,**/build/**"
    )
    .action(handleDocstringAction);

  return command;
}

