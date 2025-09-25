/**
 * 🦊 CLI Helper Functions for Vitest Configuration Generator
 * Extracted CLI logic for better testability
 */

import { VitestConfigGenerator, ConfigWriter } from "./index.js";
import { ReynardLogger } from "reynard-dev-tools-catalyst";
import type { GeneratorConfig } from "./types.js";

export interface CliOptions {
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

export interface CliResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Main CLI execution function
 */
export async function executeCli(options: CliOptions): Promise<CliResult> {
  try {
    // Create logger using catalyst
    const logger = new ReynardLogger({ verbose: options.verbose || false });

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
        return {
          success: false,
          error: "Configuration validation failed",
        };
      }
      logger.info("Configuration validation passed");
    }

    // Write configuration
    if (options.output) {
      const success = writer.writeConfig(result, options.output);
      if (!success) {
        return {
          success: false,
          error: "Failed to write configuration",
        };
      }
    } else {
      // Output to stdout
      console.log(JSON.stringify(result.config, null, 2));
    }

    logger.info(`✅ Successfully generated configuration for ${result.projectsGenerated} projects`);

    return {
      success: true,
      message: `Generated configuration for ${result.projectsGenerated} projects`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate configuration: ${(error as Error).message}`,
    };
  }
}

/**
 * Parse CLI options from process arguments
 */
export function parseCliOptions(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-v":
      case "--verbose":
        options.verbose = true;
        break;
      case "-o":
      case "--output":
        options.output = args[++i];
        break;
      case "--include-packages":
        options.includePackages = true;
        break;
      case "--include-examples":
        options.includeExamples = true;
        break;
      case "--include-templates":
        options.includeTemplates = true;
        break;
      case "--include-scripts":
        options.includeScripts = true;
        break;
      case "--max-workers":
        options.maxWorkers = args[++i];
        break;
      case "--environment":
        options.environment = args[++i];
        break;
      case "--branches":
        options.branches = args[++i];
        break;
      case "--functions":
        options.functions = args[++i];
        break;
      case "--lines":
        options.lines = args[++i];
        break;
      case "--statements":
        options.statements = args[++i];
        break;
      case "--backup":
        options.backup = true;
        break;
      case "--validate":
        options.validate = true;
        break;
    }
  }

  return options;
}
