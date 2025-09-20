#!/usr/bin/env node

/**
 * 🦊 CLI Interface for Vitest Configuration Generator
 * Command-line interface for generating Vitest configurations from project architecture
 */

import { Command } from "commander";
import { VitestConfigGenerator, ConfigWriter, VitestConfigLogger } from "./index.js";
import type { GeneratorConfig } from "./types.js";

interface CliOptions {
  verbose?: boolean;
  output?: string;
  includePackages?: boolean;
  includeExamples?: boolean;
  includeTemplates?: boolean;
  includeScripts?: boolean;
  maxWorkers?: string;
  environment?: string;
  branches?: string;
  functions?: string;
  lines?: string;
  statements?: string;
  backup?: boolean;
  validate?: boolean;
}

const program = new Command();

program
  .name("generate-vitest-config")
  .description("🦊 Generate Vitest configuration from Reynard project architecture")
  .version("1.0.0");

program
  .option("-v, --verbose", "Enable verbose output")
  .option("-o, --output <path>", "Output file path", "vitest.generated.config.ts")
  .option("--include-packages", "Include package projects in configuration", true)
  .option("--include-examples", "Include example projects in configuration", true)
  .option("--include-templates", "Include template projects in configuration", true)
  .option("--include-scripts", "Include script projects in configuration", false)
  .option("--max-workers <number>", "Maximum number of workers", "1")
  .option("--environment <env>", "Test environment", "happy-dom")
  .option("--branches <number>", "Coverage threshold for branches", "80")
  .option("--functions <number>", "Coverage threshold for functions", "85")
  .option("--lines <number>", "Coverage threshold for lines", "85")
  .option("--statements <number>", "Coverage threshold for statements", "85")
  .option("--backup", "Create backup of existing configuration", true)
  .option("--validate", "Validate generated configuration", true)
  .action(async (options: CliOptions) => {
    try {
      // Create logger
      const logger = new VitestConfigLogger(options.verbose || false);

      // Build configuration
      const config: GeneratorConfig = {
        outputPath: options.output,
        includePackages: options.includePackages,
        includeExamples: options.includeExamples,
        includeTemplates: options.includeTemplates,
        includeScripts: options.includeScripts,
        maxWorkers: parseInt(options.maxWorkers || "1", 10),
        environment: options.environment,
        customThresholds: {
          branches: parseInt(options.branches || "80", 10),
          functions: parseInt(options.functions || "85", 10),
          lines: parseInt(options.lines || "85", 10),
          statements: parseInt(options.statements || "85", 10),
        },
        verbose: options.verbose || false,
      };

      logger.info("Starting Vitest configuration generation...");

      // Create generator and writer
      const generator = new VitestConfigGenerator(logger);
      const writer = new ConfigWriter(logger);

      // Backup existing config if requested
      if (options.backup && options.output) {
        writer.backupCurrentConfig(options.output);
      }

      // Generate configuration
      const result = generator.generateConfig(config);

      // Validate configuration if requested
      if (options.validate) {
        const validation = writer.validateConfig(result.config);
        if (!validation.valid) {
          logger.error("Generated configuration is invalid:");
          validation.errors.forEach(error => logger.error(`  - ${error}`));
          process.exit(1);
        }
        logger.info("Configuration validation passed");
      }

      // Write configuration
      if (options.output) {
        const success = writer.writeConfig(result, options.output);
        if (!success) {
          process.exit(1);
        }
      } else {
        // Output to stdout
        console.log(JSON.stringify(result.config, null, 2));
      }

      // Report results
      if (result.warnings.length > 0) {
        logger.warn(`Generated with ${result.warnings.length} warnings:`);
        result.warnings.forEach(warning => logger.warn(`  - ${warning}`));
      }

      if (result.errors.length > 0) {
        logger.error(`Generated with ${result.errors.length} errors:`);
        result.errors.forEach(error => logger.error(`  - ${error}`));
        process.exit(1);
      }

      logger.info(`✅ Successfully generated configuration for ${result.projectsGenerated} projects`);

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
  $ generate-vitest-config
  $ generate-vitest-config --verbose
  $ generate-vitest-config --output vitest.config.ts
  $ generate-vitest-config --include-examples --include-templates
  $ generate-vitest-config --max-workers 4 --environment node
  $ generate-vitest-config --branches 90 --functions 95 --lines 95 --statements 95
  $ generate-vitest-config --backup --validate
`
);

program.parse();
