#!/usr/bin/env node

/**
 * 🐺 CLI Interface for Workflow Shell Extractor
 * Command-line interface for the workflow shell script extraction and validation tool
 */

import { Command } from "commander";
import { WorkflowShellExtractor } from "./WorkflowShellExtractor.js";
import type { ExtractorOptions } from "./types.js";

interface CliOptions {
  verbose?: boolean;
  fix?: boolean;
  workflowDir?: string;
  tempDir?: string;
  shellcheckRc?: string;
  maxScripts?: string;
  include?: string[];
  exclude?: string[];
}

const program = new Command();

program
  .name("extract-workflow-shell")
  .description("🐺 Extract and validate shell scripts from GitHub Actions workflows")
  .version("1.0.0");

program
  .option("-v, --verbose", "Enable verbose output")
  .option("--fix", "Enable automatic fixing mode")
  .option("--workflow-dir <path>", "Directory containing workflow files", ".github/workflows")
  .option("--temp-dir <path>", "Temporary directory for script extraction", "/tmp/workflow_shell_extraction")
  .option("--shellcheck-rc <path>", "Path to shellcheck configuration file", ".shellcheckrc")
  .option("--max-scripts <number>", "Maximum number of scripts to process", "1000")
  .option("--include <patterns...>", "File patterns to include", ["*.yml", "*.yaml"])
  .option("--exclude <patterns...>", "File patterns to exclude", ["*.test.yml", "*.test.yaml"])
  .action(async (options: CliOptions) => {
    try {
      const extractorOptions: ExtractorOptions = {
        verbose: options.verbose || false,
        fixMode: options.fix || false,
        workflowDir: options.workflowDir,
        tempDir: options.tempDir,
        shellcheckRc: options.shellcheckRc,
        maxScripts: options.maxScripts ? parseInt(options.maxScripts, 10) : undefined,
        includePatterns: options.include,
        excludePatterns: options.exclude,
      };

      const extractor = new WorkflowShellExtractor(extractorOptions);
      const result = await extractor.processWorkflows();

      // Exit with appropriate code
      process.exit(result.success ? 0 : 1);
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
  $ extract-workflow-shell
  $ extract-workflow-shell --verbose
  $ extract-workflow-shell --fix
  $ extract-workflow-shell --workflow-dir ./workflows --verbose
  $ extract-workflow-shell --include "*.yml" --exclude "*.test.yml"
`
);

program.parse();
