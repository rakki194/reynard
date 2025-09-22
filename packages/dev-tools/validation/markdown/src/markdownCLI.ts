#!/usr/bin/env node

/**
 * 🦊 Markdown Validation CLI
 * Now powered by Catalyst for consistent CLI patterns
 */

import { BaseCLI, ReynardLogger } from "reynard-dev-tools-catalyst";
import { ToCValidator } from "./toc-validator.js";
import { LinksValidator } from "./links-validator.js";
import { SentenceLengthValidator } from "./sentence-length-validator.js";
import type { ToCValidationOptions, LinkValidationOptions, SentenceLengthOptions } from "./types.js";

export class MarkdownValidationCLI extends BaseCLI {
  constructor() {
    super({
      name: "markdown-validator",
      description: "🦊 Markdown validation tools for the Reynard ecosystem",
      version: "1.0.0"
    });
  }

  protected setupCommands(): void {
    this.addCommand({
      name: "toc <file>",
      description: "Validate Table of Contents",
      options: {
        "--fix": "Automatically fix issues"
      },
      action: (options: any) => this.handleTocValidation(options.file, options)
    });

    this.addCommand({
      name: "links <file>",
      description: "Validate links",
      options: {
        "--fix": "Automatically fix issues"
      },
      action: (options: any) => this.handleLinksValidation(options.file, options)
    });

    this.addCommand({
      name: "sentence-length <file>",
      description: "Validate sentence length",
      options: {
        "--max-length <number>": "Maximum sentence length (default: 100)"
      },
      action: (options: any) => this.handleSentenceLengthValidation(options.file, options)
    });

    this.addCommand({
      name: "test-conflict",
      description: "Test ToC conflict detection",
      action: (options: any) => this.handleTestConflict()
    });

    this.addHelpExamples([
      "markdown-validator toc README.md",
      "markdown-validator links docs/CONTRIBUTING.md --fix",
      "markdown-validator sentence-length src/index.md --max-length 80 --verbose"
    ]);
  }

  private async handleTocValidation(file: string, cliOptions: ToCValidationOptions): Promise<void> {
    this.logStartup();
    this.logger.info(`Validating Table of Contents for: ${file}`);
    this.logger.info(`Fix mode: ${cliOptions.fix ? "enabled" : "disabled"}`);

    try {
      const validator = new ToCValidator(this.logger);
      const result = await validator.validateFile(file, { fix: cliOptions.fix, verbose: this.isVerbose() });

      if (result.success) {
        this.logger.success("Table of Contents validation passed!");
        if (result.fixes && result.fixes.length > 0) {
          result.fixes.forEach((fix: string) => this.logger.info(`  - ${fix}`));
        }
      } else {
        this.logger.error("Table of Contents validation failed:");
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => this.logger.warn(`  - ${warning}`));
        }
      }
      this.logCompletion(result.success, "ToC validation completed.");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleLinksValidation(file: string, cliOptions: LinkValidationOptions): Promise<void> {
    this.logStartup();
    this.logger.info(`Validating links for: ${file}`);

    try {
      const validator = new LinksValidator(this.logger);
      const result = await validator.validateFile(file, { verbose: this.isVerbose() });

      if (result.success) {
        this.logger.success("Link validation passed!");
        if (result.fixes && result.fixes.length > 0) {
          result.fixes.forEach((fix: string) => this.logger.info(`  - ${fix}`));
        }
      } else {
        this.logger.error("Link validation failed:");
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => this.logger.warn(`  - ${warning}`));
        }
      }
      this.logCompletion(result.success, "Link validation completed.");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleSentenceLengthValidation(file: string, cliOptions: SentenceLengthOptions): Promise<void> {
    this.logStartup();
    this.logger.info(`Validating sentence length for: ${file}`);
    this.logger.info(`Max length: ${cliOptions.maxLength || 100}`);

    try {
      const validator = new SentenceLengthValidator(this.logger);
      const result = await validator.validateFile(file, { maxLength: typeof cliOptions.maxLength === 'string' ? parseInt(cliOptions.maxLength) : cliOptions.maxLength || 100, verbose: this.isVerbose() });

      if (result.success) {
        this.logger.success("Sentence length validation passed!");
        if (result.fixes && result.fixes.length > 0) {
          result.fixes.forEach((fix: string) => this.logger.info(`  - ${fix}`));
        }
      } else {
        this.logger.error("Sentence length validation failed:");
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => this.logger.warn(`  - ${warning}`));
        }
      }
      this.logCompletion(result.success, "Sentence length validation completed.");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleTestConflict(): Promise<void> {
    this.logStartup();
    this.logger.info("Running ToC conflict detection test...");

    try {
      const validator = new ToCValidator(this.logger);
      const result = validator.testConflictDetection();

      if (result.success) {
        this.logger.success("ToC conflict detection test passed!");
        if (result.fixes && result.fixes.length > 0) {
          result.fixes.forEach((fix: string) => this.logger.info(`  - ${fix}`));
        }
      } else {
        this.logger.error("ToC conflict detection test failed:");
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
        if (result.error) {
          this.logger.error(`  - ${result.error}`);
        }
      }
      this.logCompletion(result.success, "ToC conflict detection test completed.");
    } catch (error) {
      this.handleError(error as Error);
    }
  }
}

// Create and run the CLI only when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new MarkdownValidationCLI();
  cli.parse();
}