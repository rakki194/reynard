/**
 * 🦊 Reynard File Processing Processors (TypeScript)
 *
 * This module provides predefined processor functions for common file processing tasks
 * including validation, formatting, and quality checks.
 */

import { execSync } from "child_process";
import type { ProcessingOptions } from "./types.js";

// Colors for terminal output (matching Reynard style)
const Colors = {
  RED: "\u001b[0;31m",
  GREEN: "\u001b[0;32m",
  YELLOW: "\u001b[1;33m",
  BLUE: "\u001b[0;34m",
  PURPLE: "\u001b[0;35m",
  CYAN: "\u001b[0;36m",
  WHITE: "\u001b[1;37m",
  NC: "\u001b[0m", // No Color
} as const;

function printColored(message: string, color: string = Colors.NC): void {
  console.log(`${color}${message}${Colors.NC}`);
}

/**
 * Predefined processor functions for common tasks
 */
export const Processors = {
  /**
   * Wait for file to be stable (not being written to)
   */
  async waitForStable(filePath: string, options: ProcessingOptions = {}): Promise<void> {
    const delay = options.delay || 500;
    printColored(`  ⏳ Waiting ${delay}ms for file to stabilize...`, Colors.YELLOW);
    await new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Run sentence length validation
   */
  async validateSentenceLength(filePath: string): Promise<void> {
    try {
      execSync(`node packages/dev-tools/validation/markdown/dist/cli.js sentence-length --fix "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      printColored(`  ❌ Sentence length validation failed: ${errorMessage}`, Colors.RED);
      throw error;
    }
  },

  /**
   * Run ToC validation (if needed)
   */
  async validateToC(filePath: string): Promise<void> {
    try {
      execSync(`node packages/dev-tools/validation/markdown/dist/cli.js toc --fix "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      printColored(`  ❌ ToC validation failed: ${errorMessage}`, Colors.RED);
      throw error;
    }
  },

  /**
   * Run link validation
   */
  async validateLinks(filePath: string): Promise<void> {
    try {
      execSync(`node packages/dev-tools/validation/markdown/dist/cli.js links "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      printColored(`  ❌ Link validation failed: ${errorMessage}`, Colors.RED);
      throw error;
    }
  },

  /**
   * Run Prettier formatting
   */
  async formatWithPrettier(filePath: string): Promise<void> {
    try {
      execSync(`pnpm exec prettier --write "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      printColored(`  ⚠️  Prettier not available or failed: ${errorMessage}`, Colors.YELLOW);
      // Don't throw - Prettier is optional
    }
  },

  /**
   * Run ESLint fix
   */
  async fixWithESLint(filePath: string): Promise<void> {
    try {
      execSync(`pnpm exec eslint --fix "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      printColored(`  ⚠️  ESLint not available or failed: ${errorMessage}`, Colors.YELLOW);
      // Don't throw - ESLint is optional
    }
  },

  /**
   * Run Python validation
   */
  async validatePython(filePath: string): Promise<void> {
    try {
      execSync(`python3 scripts/validate_python.py "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      printColored(`  ❌ Python validation failed: ${errorMessage}`, Colors.RED);
      throw error;
    }
  },
} as const;
