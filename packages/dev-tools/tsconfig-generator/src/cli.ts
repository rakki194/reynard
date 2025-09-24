#!/usr/bin/env node

/**
 * 🦊 TypeScript Configuration Generator CLI
 * Now powered by Catalyst for consistent CLI patterns
 */

import { BaseCLI, ReynardLogger, CLIUtils } from "reynard-dev-tools-catalyst";
import { TSConfigGenerator } from "./tsconfigGenerator.js";
import { writeFileSync } from "fs";

class TSConfigCLI extends BaseCLI {
  constructor() {
    super({
      name: "generate-tsconfig",
      description: "🦊 Generate TypeScript configurations from project architecture",
      version: "1.0.0"
    });
  }

  protected setupCommands(): void {
    this.addCommand({
      name: "generate",
      description: "Generate TypeScript configuration",
      options: {
        "-o, --output <path>": "Output file path",
        "--include-packages": "Include source packages (default: true)",
        "--include-templates": "Include template projects (default: true)", 
        "--include-scripts": "Include scripts (default: true)",
        "--include-tools": "Include tools packages (default: true)",
        "--include-documentation": "Include documentation packages (default: true)",
        "--include-testing": "Include testing packages (default: true)",
        "--include-non-buildable": "Include non-buildable directories (default: false)",
        "--exclude-packages": "Exclude source packages",
        "--exclude-templates": "Exclude template projects", 
        "--exclude-scripts": "Exclude scripts",
        "--exclude-tools": "Exclude tools packages",
        "--exclude-documentation": "Exclude documentation packages",
        "--exclude-testing": "Exclude testing packages",
        "--include-references": "Include package references",
        "--generate-individual": "Generate individual package tsconfigs"
      },
      action: this.handleGenerate.bind(this)
    });

    // Add help examples
    this.addHelpExamples([
      "generate-tsconfig generate",
      "generate-tsconfig generate --verbose --backup",
      "generate-tsconfig generate --output tsconfig.json --include-packages",
      "generate-tsconfig generate --generate-individual --validate"
    ]);
  }

  private async handleGenerate(options: any): Promise<void> {
    try {
      this.logStartup();
      
      const generator = new TSConfigGenerator();
      
      if (this.isVerbose()) {
        this.logger.info("Configuration Options:");
        this.logger.info(`  Output: ${options.output || "tsconfig.generated.json"}`);
        this.logger.info(`  Include packages: ${options.includePackages !== false}`);
        this.logger.info(`  Include templates: ${options.includeTemplates !== false}`);
        this.logger.info(`  Include scripts: ${options.includeScripts !== false}`);
        this.logger.info(`  Include tools: ${options.includeTools !== false}`);
        this.logger.info(`  Include documentation: ${options.includeDocumentation !== false}`);
        this.logger.info(`  Include testing: ${options.includeTesting !== false}`);
        this.logger.info(`  Include non-buildable: ${options.includeNonBuildable || false}`);
        this.logger.info(`  Include references: ${options.includeReferences}`);
        this.logger.info(`  Generate individual: ${options.generateIndividual}`);
      }

      const outputPath = options.output || "tsconfig.generated.json";

      // Handle backup using catalyst utilities
      if (this.shouldBackup()) {
        this.handleBackup(outputPath);
      }

      // Generate configuration
      const result = generator.generateConfig({
        includePackages: options.excludePackages ? false : (options.includePackages !== false), // Default to true unless excluded
        includeTemplates: options.excludeTemplates ? false : (options.includeTemplates !== false), // Default to true unless excluded
        includeScripts: options.excludeScripts ? false : (options.includeScripts !== false), // Default to true unless excluded
        includeTools: options.excludeTools ? false : (options.includeTools !== false), // Default to true unless excluded
        includeDocumentation: options.excludeDocumentation ? false : (options.includeDocumentation !== false), // Default to true unless excluded
        includeTesting: options.excludeTesting ? false : (options.includeTesting !== false), // Default to true unless excluded
        includeNonBuildable: options.includeNonBuildable || false, // Default to false
        includeReferences: options.includeReferences,
        generateIndividual: options.generateIndividual,
        outputPath: outputPath,
        verbose: this.isVerbose(),
      });

      if (result.success) {
        // Write configuration to file
        writeFileSync(outputPath, JSON.stringify(result.config, null, 2));
        
        this.logger.success("Generated TypeScript configuration successfully!");
        this.logger.info(`📁 Output: ${outputPath}`);
        this.logger.info(`📦 Packages processed: ${result.packagesProcessed}`);
        
        if (result.warnings.length > 0) {
          this.logger.warn("Warnings:");
          result.warnings.forEach(warning => this.logger.warn(`  - ${warning}`));
        }

        if (this.isVerbose()) {
          this.logger.section("Configuration Summary");
          this.logger.info(`Total packages: ${result.packagesProcessed}`);
          this.logger.info("Architecture-driven: ✅");
          this.logger.info("Modern paths: ✅ (packages/core/core)");
          this.logger.info(`References: ${options.includeReferences ? '✅' : '❌'}`);
        }

        // Handle validation using catalyst utilities
        if (this.shouldValidate()) {
          const validation = CLIUtils.validateConfig(result.config, ['compilerOptions', 'include']);
          if (!validation.valid) {
            this.logger.error("Configuration validation failed:");
            validation.errors.forEach(error => this.logger.error(`  - ${error}`));
            process.exit(1);
          } else {
            this.logger.success("Configuration validation passed");
          }
        }

        this.logCompletion(true, "TypeScript configuration generation completed successfully!");
      } else {
        this.logger.error("Failed to generate configuration:");
        result.errors.forEach(error => this.logger.error(`  - ${error}`));
        this.logCompletion(false, "Configuration generation failed");
        process.exit(1);
      }

    } catch (error) {
      this.handleError(error as Error);
    }
  }
}

// Create and run the CLI
const cli = new TSConfigCLI();
cli.parse();
