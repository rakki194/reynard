#!/usr/bin/env node

/**
 * 🦊 CLI Interface for Vitest Configuration Generator
 * Now powered by Catalyst for consistent CLI patterns and unified logging
 */

import { BaseCLI, ReynardLogger, CLIUtils } from "reynard-dev-tools-catalyst";
import { VitestConfigGenerator, ConfigWriter } from "./index.js";
import type { GeneratorConfig } from "./types.js";

class VitestConfigCLI extends BaseCLI {
  constructor() {
    super({
      name: "generate-vitest-config",
      description: "🦊 Generate Vitest configuration from Reynard project architecture",
      version: "1.0.0"
    });
  }

  protected setupCommands(): void {
    this.addCommand({
      name: "generate",
      description: "Generate Vitest configuration",
      options: {
        "-o, --output <path>": "Output file path",
        "--include-packages": "Include package projects in configuration",
        "--include-examples": "Include example projects in configuration",
        "--include-templates": "Include template projects in configuration",
        "--include-scripts": "Include script projects in configuration",
        "--max-workers <number>": "Maximum number of workers",
        "--environment <env>": "Test environment",
        "--branches <number>": "Coverage threshold for branches",
        "--functions <number>": "Coverage threshold for functions",
        "--lines <number>": "Coverage threshold for lines",
        "--statements <number>": "Coverage threshold for statements"
      },
      action: this.handleGenerate.bind(this)
    });

    // Add help examples
    this.addHelpExamples([
      "generate-vitest-config generate",
      "generate-vitest-config generate --verbose",
      "generate-vitest-config generate --output vitest.config.ts",
      "generate-vitest-config generate --include-examples --include-templates",
      "generate-vitest-config generate --max-workers 4 --environment node",
      "generate-vitest-config generate --branches 90 --functions 95 --lines 95 --statements 95",
      "generate-vitest-config generate --backup --validate"
    ]);
  }

  private async handleGenerate(options: any): Promise<void> {
    try {
      this.logStartup();
      
      // Build configuration
      const config: GeneratorConfig = {
        outputPath: options.output || "vitest.generated.config.ts",
        includePackages: options.includePackages,
        includeExamples: options.includeExamples,
        includeTemplates: options.includeTemplates,
        includeScripts: options.includeScripts,
        maxWorkers: parseInt(options.maxWorkers || "1", 10),
        environment: options.environment || "happy-dom",
        customThresholds: {
          branches: parseInt(options.branches || "80", 10),
          functions: parseInt(options.functions || "85", 10),
          lines: parseInt(options.lines || "85", 10),
          statements: parseInt(options.statements || "85", 10),
        },
        verbose: this.isVerbose(),
      };

      this.logger.info("Starting Vitest configuration generation...");

      if (this.isVerbose()) {
        this.logger.info("Configuration Options:");
        this.logger.info(`  Output: ${config.outputPath}`);
        this.logger.info(`  Include packages: ${config.includePackages}`);
        this.logger.info(`  Include examples: ${config.includeExamples}`);
        this.logger.info(`  Include templates: ${config.includeTemplates}`);
        this.logger.info(`  Include scripts: ${config.includeScripts}`);
        this.logger.info(`  Max workers: ${config.maxWorkers}`);
        this.logger.info(`  Environment: ${config.environment}`);
        this.logger.info(`  Coverage thresholds: ${JSON.stringify(config.customThresholds)}`);
      }

      // Create generator and writer using catalyst logger
      const generator = new VitestConfigGenerator(this.logger);
      const writer = new ConfigWriter(this.logger);

      // Handle backup using catalyst utilities
      if (this.shouldBackup() && config.outputPath) {
        this.handleBackup(config.outputPath);
      }

      // Generate configuration
      const result = generator.generateConfig(config);

      // Handle validation using catalyst utilities
      if (this.shouldValidate()) {
        const validation = CLIUtils.validateConfig(result.config, ['test', 'coverage']);
        if (!validation.valid) {
          this.logger.error("Generated configuration is invalid:");
          validation.errors.forEach(error => this.logger.error(`  - ${error}`));
          this.logCompletion(false, "Configuration validation failed");
          process.exit(1);
        }
        this.logger.success("Configuration validation passed");
      }

      // Write configuration
      if (config.outputPath) {
        const success = writer.writeConfig(result, config.outputPath);
        if (!success) {
          this.logCompletion(false, "Failed to write configuration");
          process.exit(1);
        }
      } else {
        // Output to stdout
        console.log(JSON.stringify(result.config, null, 2));
      }

      // Report results
      if (result.warnings.length > 0) {
        this.logger.warn(`Generated with ${result.warnings.length} warnings:`);
        result.warnings.forEach(warning => this.logger.warn(`  - ${warning}`));
      }

      if (result.errors.length > 0) {
        this.logger.error(`Generated with ${result.errors.length} errors:`);
        result.errors.forEach(error => this.logger.error(`  - ${error}`));
        this.logCompletion(false, "Configuration generation failed");
        process.exit(1);
      }

      this.logger.success(`Successfully generated configuration for ${result.projectsGenerated} projects`);
      
      if (this.isVerbose()) {
        this.logger.section("Generation Summary");
        this.logger.info(`Projects generated: ${result.projectsGenerated}`);
        this.logger.info(`Output file: ${config.outputPath}`);
        this.logger.info(`Environment: ${config.environment}`);
        this.logger.info(`Max workers: ${config.maxWorkers}`);
      }

      this.logCompletion(true, "Vitest configuration generation completed successfully!");
    } catch (error) {
      this.handleError(error as Error);
    }
  }
}

// Create and run the CLI
const cli = new VitestConfigCLI();
cli.parse();
