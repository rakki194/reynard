/**
 * ⚗️ Catalyst Base CLI
 * Base class for consistent CLI implementations across all Reynard dev-tools
 */

import { Command } from "commander";
import type { BaseCLIConfig, CLIOptions, CLICommand } from "../types/CLI.js";
import { ReynardLogger } from "../logger/ReynardLogger.js";
import { CLIUtils } from "./CLIUtils.js";

export abstract class BaseCLI {
  protected readonly program: Command;
  protected readonly logger: ReynardLogger;
  protected readonly config: BaseCLIConfig;

  constructor(config: BaseCLIConfig) {
    this.config = config;
    this.program = new Command();
    this.logger = new ReynardLogger({ verbose: config.options?.verbose || false });

    this.setupProgram();
    this.addCommonOptions();
    this.setupCommands();
  }

  /**
   * Setup the main program
   */
  private setupProgram(): void {
    this.program.name(this.config.name).description(this.config.description).version(this.config.version);
  }

  /**
   * Add common options to all CLI commands
   */
  protected addCommonOptions(): void {
    this.program
      .option("-v, --verbose", "Enable verbose output")
      .option("--backup", "Create backup of existing files")
      .option("--validate", "Validate generated output");
  }

  /**
   * Setup specific commands (to be implemented by subclasses)
   */
  protected abstract setupCommands(): void;

  /**
   * Add a command to the CLI
   */
  protected addCommand(command: CLICommand): void {
    const cmd = this.program.command(command.name).description(command.description);

    if (command.options) {
      for (const [option, config] of Object.entries(command.options)) {
        if (typeof config === "string") {
          cmd.option(option, config);
        } else {
          cmd.option(option, config.description, config.defaultValue);
        }
      }
    }

    cmd.action(command.action);
  }

  /**
   * Handle backup creation
   */
  protected handleBackup(filePath: string, backupDir?: string): void {
    if (!this.program.opts().backup) {
      return;
    }

    const result = CLIUtils.createBackup({
      filePath,
      backupDir,
      timestamp: true,
    });

    if (result.success) {
      this.logger.info(`📦 Backed up existing file to: ${result.backupPath}`);
    } else {
      this.logger.warn(`⚠️  Could not create backup: ${result.error}`);
    }
  }

  /**
   * Handle validation
   */
  protected handleValidation(data: any, requiredFields: string[]): boolean {
    if (!this.program.opts().validate) {
      return true;
    }

    const validation = CLIUtils.validateConfig(data, requiredFields);

    if (validation.valid) {
      this.logger.success("✅ Validation passed");
      return true;
    } else {
      this.logger.error("❌ Validation failed:");
      validation.errors.forEach((error: string) => this.logger.error(`  - ${error}`));
      return false;
    }
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: Error): void {
    const verbose = this.program.opts().verbose;
    CLIUtils.handleError(error, verbose);
  }

  /**
   * Setup graceful shutdown
   */
  protected setupGracefulShutdown(cleanup?: () => void): void {
    CLIUtils.setupGracefulShutdown(cleanup);
  }

  /**
   * Get parsed options
   */
  protected getOptions(): CLIOptions {
    return this.program.opts();
  }

  /**
   * Check if verbose mode is enabled
   */
  protected isVerbose(): boolean {
    return this.getOptions().verbose || false;
  }

  /**
   * Check if backup is enabled
   */
  protected shouldBackup(): boolean {
    return this.getOptions().backup || false;
  }

  /**
   * Check if validation is enabled
   */
  protected shouldValidate(): boolean {
    return this.getOptions().validate || false;
  }

  /**
   * Add help examples
   */
  protected addHelpExamples(examples: string[]): void {
    this.program.addHelpText("after", `\nExamples:\n${examples.map(ex => `  ${ex}`).join("\n")}\n`);
  }

  /**
   * Parse command line arguments
   */
  parse(args?: string[]): void {
    this.program.parse(args);
  }

  /**
   * Get the commander program instance
   */
  getProgram(): Command {
    return this.program;
  }

  /**
   * Get the logger instance
   */
  getLogger(): ReynardLogger {
    return this.logger;
  }

  /**
   * Set verbose mode
   */
  setVerbose(verbose: boolean): void {
    this.logger.setVerbose(verbose);
  }

  /**
   * Log startup information
   */
  protected logStartup(): void {
    this.logger.header(`${this.config.name} v${this.config.version}`);
    this.logger.info(this.config.description);

    if (this.isVerbose()) {
      this.logger.debug("Verbose mode enabled");
    }
  }

  /**
   * Log completion information
   */
  protected logCompletion(success: boolean, message: string): void {
    if (success) {
      this.logger.success(message);
    } else {
      this.logger.error(message);
    }
  }
}
