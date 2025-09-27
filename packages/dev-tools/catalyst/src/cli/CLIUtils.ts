/**
 * ⚗️ Catalyst CLI Utilities
 * Common CLI utility functions for all Reynard dev-tools
 */

import fs from "fs";
import path from "path";
import type { BackupOptions, CLIValidationResult } from "../types/CLI.js";

export class CLIUtils {
  /**
   * Create a backup of an existing file
   */
  static createBackup(options: BackupOptions): { success: boolean; backupPath?: string; error?: string } {
    const { filePath, backupDir, timestamp = true } = options;

    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: "File does not exist" };
      }

      const backupDirPath = backupDir || path.join(process.cwd(), ".catalyst-backups");

      // Ensure backup directory exists
      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName);
      const baseName = path.basename(fileName, fileExt);

      let backupFileName: string;
      if (timestamp) {
        const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
        backupFileName = `${baseName}.${timestampStr}.backup${fileExt}`;
      } else {
        backupFileName = `${baseName}.backup${fileExt}`;
      }

      const backupPath = path.join(backupDirPath, backupFileName);
      fs.copyFileSync(filePath, backupPath);

      return { success: true, backupPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Validate a configuration object
   */
  static validateConfig(config: any, requiredFields: string[]): CLIValidationResult {
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!(field in config) || config[field] === undefined || config[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Parse command line arguments for common options
   */
  static parseCommonOptions(args: string[]): {
    verbose: boolean;
    backup: boolean;
    validate: boolean;
    output?: string;
  } {
    return {
      verbose: args.includes("--verbose") || args.includes("-v"),
      backup: args.includes("--backup"),
      validate: args.includes("--validate"),
      output: this.getOptionValue(args, ["--output", "-o"]),
    };
  }

  /**
   * Get value for a command line option
   */
  static getOptionValue(args: string[], optionNames: string[]): string | undefined {
    for (const optionName of optionNames) {
      const index = args.indexOf(optionName);
      if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
      }
    }
    return undefined;
  }

  /**
   * Check if a command line option is present
   */
  static hasOption(args: string[], optionNames: string[]): boolean {
    return optionNames.some(optionName => args.includes(optionName));
  }

  /**
   * Format help text with examples
   */
  static formatHelpText(command: string, description: string, examples: string[]): string {
    let helpText = `\n${description}\n\n`;
    helpText += `Usage: ${command} [options]\n\n`;
    helpText += `Examples:\n`;
    examples.forEach(example => {
      helpText += `  ${example}\n`;
    });
    return helpText;
  }

  /**
   * Handle common CLI errors
   */
  static handleError(error: Error, verbose: boolean = false): void {
    console.error(`❌ Error: ${error.message}`);
    if (verbose && error.stack) {
      console.error(`\nStack trace:\n${error.stack}`);
    }
    process.exit(1);
  }

  /**
   * Handle process signals for graceful shutdown
   */
  static setupGracefulShutdown(cleanup?: () => void): void {
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      if (cleanup) {
        cleanup();
      }
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }

  /**
   * Check if running in development mode
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";
  }

  /**
   * Get current working directory
   */
  static getCwd(): string {
    return process.cwd();
  }

  /**
   * Resolve path relative to current working directory
   */
  static resolvePath(relativePath: string): string {
    return path.resolve(process.cwd(), relativePath);
  }

  /**
   * Check if file exists
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Read JSON file safely
   */
  static readJsonFile(filePath: string): { success: boolean; data?: any; error?: string } {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Write JSON file safely
   */
  static writeJsonFile(filePath: string, data: any, pretty: boolean = true): { success: boolean; error?: string } {
    try {
      const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      fs.writeFileSync(filePath, content, "utf-8");
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
