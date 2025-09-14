#!/usr/bin/env node
/**
 * Base Validation Classes for Reynard Validation Scripts
 *
 * Provides common validation result classes and base validation patterns
 * used across all validation tools.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import { Colors, printColored } from "./colors.js";

/**
 * Base validation result class
 */
export class ValidationResult {
  constructor(file, line = null, column = null, message = "", type = "info", status = "valid") {
    this.file = file;
    this.line = line;
    this.column = column;
    this.message = message;
    this.type = type;
    this.status = status; // 'valid', 'warning', 'error', 'broken'
    this.suggestion = null;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Set a suggestion for fixing this issue
   * @param {string} suggestion - Suggestion text
   * @returns {ValidationResult} This instance for chaining
   */
  withSuggestion(suggestion) {
    this.suggestion = suggestion;
    return this;
  }

  /**
   * Check if this result represents an error
   * @returns {boolean} True if this is an error
   */
  isError() {
    return this.status === "error" || this.status === "broken";
  }

  /**
   * Check if this result represents a warning
   * @returns {boolean} True if this is a warning
   */
  isWarning() {
    return this.status === "warning";
  }

  /**
   * Check if this result is valid
   * @returns {boolean} True if this is valid
   */
  isValid() {
    return this.status === "valid";
  }

  /**
   * Get formatted location string
   * @returns {string} Formatted location
   */
  getLocation() {
    if (this.line && this.column) {
      return `${this.file}:${this.line}:${this.column}`;
    }
    if (this.line) {
      return `${this.file}:${this.line}`;
    }
    return this.file;
  }

  /**
   * Get formatted result string
   * @returns {string} Formatted result
   */
  toString() {
    const location = this.getLocation();
    let statusIcon = "✅";
    if (this.isError()) {
      statusIcon = "❌";
    } else if (this.isWarning()) {
      statusIcon = "⚠️";
    }
    return `${statusIcon} ${location}: ${this.message}`;
  }
}

/**
 * File validation result container
 */
export class FileValidationResult {
  constructor(file) {
    this.file = file;
    this.results = [];
    this.errors = [];
    this.warnings = [];
    this.valid = true;
    this.stats = {
      total: 0,
      valid: 0,
      warnings: 0,
      errors: 0,
    };
  }

  /**
   * Add a validation result
   * @param {ValidationResult} result - Result to add
   */
  addResult(result) {
    this.results.push(result);
    this.stats.total++;

    if (result.isError()) {
      this.errors.push(result);
      this.valid = false;
      this.stats.errors++;
    } else if (result.isWarning()) {
      this.warnings.push(result);
      this.stats.warnings++;
    } else {
      this.stats.valid++;
    }
  }

  /**
   * Check if file has any issues
   * @returns {boolean} True if file has issues
   */
  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }

  /**
   * Get summary string
   * @returns {string} Summary of validation results
   */
  getSummary() {
    const parts = [];
    if (this.stats.valid > 0) parts.push(`${this.stats.valid} valid`);
    if (this.stats.warnings > 0) parts.push(`${this.stats.warnings} warnings`);
    if (this.stats.errors > 0) parts.push(`${this.stats.errors} errors`);
    return parts.join(", ");
  }
}

/**
 * Base validator class with common functionality
 */
export class BaseValidator {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      strict: false,
      fix: false,
      ...options,
    };
    this.results = [];
    this.stats = {
      totalFiles: 0,
      totalResults: 0,
      validResults: 0,
      warningResults: 0,
      errorResults: 0,
    };
  }

  /**
   * Log a message if verbose mode is enabled
   * @param {string} message - Message to log
   * @param {string} color - Color to use
   */
  log(message, color = Colors.NC) {
    if (this.options.verbose) {
      printColored(message, color);
    }
  }

  /**
   * Validate a single file
   * @param {string} filePath - File path to validate
   * @returns {FileValidationResult} Validation result
   */
  async validateFile(filePath) {
    throw new Error("validateFile must be implemented by subclass");
  }

  /**
   * Validate multiple files
   * @param {string[]} filePaths - File paths to validate
   * @returns {FileValidationResult[]} Array of validation results
   */
  async validateFiles(filePaths) {
    const results = [];
    this.stats.totalFiles = filePaths.length;

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      this.log(`🔍 Validating: ${filePath} (${i + 1}/${filePaths.length})`, Colors.CYAN);

      try {
        const result = await this.validateFile(filePath);
        results.push(result);
        this.results.push(result);

        // Update stats
        this.stats.totalResults += result.stats.total;
        this.stats.validResults += result.stats.valid;
        this.stats.warningResults += result.stats.warnings;
        this.stats.errorResults += result.stats.errors;

        // Log result
        if (result.valid) {
          this.log(`  ✅ ${result.getSummary()}`, Colors.GREEN);
        } else {
          this.log(`  ❌ ${result.getSummary()}`, Colors.RED);
        }
      } catch (error) {
        this.log(`  ❌ Error validating file: ${error.message}`, Colors.RED);
        const errorResult = new FileValidationResult(filePath);
        errorResult.addResult(
          new ValidationResult(filePath, null, null, `Validation error: ${error.message}`, "error", "error")
        );
        results.push(errorResult);
      }
    }

    return results;
  }

  /**
   * Check if validation passed
   * @returns {boolean} True if validation passed
   */
  hasErrors() {
    return this.stats.errorResults > 0;
  }

  /**
   * Check if validation has warnings
   * @returns {boolean} True if validation has warnings
   */
  hasWarnings() {
    return this.stats.warningResults > 0;
  }

  /**
   * Get exit code for CLI
   * @returns {number} Exit code (0 = success, 1 = error, 2 = warnings)
   */
  getExitCode() {
    if (this.hasErrors()) return 1;
    if (this.hasWarnings()) return 2;
    return 0;
  }

  /**
   * Print validation summary
   */
  printSummary() {
    printColored("", Colors.NC);
    printColored("📊 Validation Summary", Colors.PURPLE);
    printColored("=".repeat(30), Colors.CYAN);
    printColored(`📁 Files processed: ${this.stats.totalFiles}`, Colors.BLUE);
    printColored(`📎 Total results: ${this.stats.totalResults}`, Colors.BLUE);
    printColored(`✅ Valid: ${this.stats.validResults}`, Colors.GREEN);
    printColored(`⚠️  Warnings: ${this.stats.warningResults}`, Colors.YELLOW);
    printColored(`❌ Errors: ${this.stats.errorResults}`, Colors.RED);
  }

  /**
   * Print detailed results
   */
  printDetailedResults() {
    for (const result of this.results) {
      if (result.hasIssues()) {
        this.printFileResults(result);
      }
    }
  }

  /**
   * Print results for a single file
   * @param {FileValidationResult} result - File validation result
   */
  printFileResults(result) {
    printColored(`\n📄 ${result.file}`, Colors.BLUE);

    for (const validationResult of result.results) {
      if (!validationResult.isValid()) {
        this.printValidationResult(validationResult);
      }
    }
  }

  /**
   * Print a single validation result
   * @param {ValidationResult} validationResult - Validation result to print
   */
  printValidationResult(validationResult) {
    const color = validationResult.isError() ? Colors.RED : Colors.YELLOW;
    printColored(`  ${validationResult.toString()}`, color);

    if (validationResult.suggestion) {
      printColored(`    💡 ${validationResult.suggestion}`, Colors.YELLOW);
    }
  }
}

/**
 * Create a validation result
 * @param {string} file - File path
 * @param {number} line - Line number
 * @param {number} column - Column number
 * @param {string} message - Message
 * @param {string} type - Result type
 * @param {string} status - Result status
 * @returns {ValidationResult} Validation result
 */
export function createResult(file, line, column, message, type, status) {
  return new ValidationResult(file, line, column, message, type, status);
}

/**
 * Create an error result
 * @param {string} file - File path
 * @param {number} line - Line number
 * @param {string} message - Error message
 * @returns {ValidationResult} Error result
 */
export function createError(file, line, message) {
  return createResult(file, line, null, message, "error", "error");
}

/**
 * Create a warning result
 * @param {string} file - File path
 * @param {number} line - Line number
 * @param {string} message - Warning message
 * @returns {ValidationResult} Warning result
 */
export function createWarning(file, line, message) {
  return createResult(file, line, null, message, "warning", "warning");
}

/**
 * Create a valid result
 * @param {string} file - File path
 * @param {number} line - Line number
 * @param {string} message - Success message
 * @returns {ValidationResult} Valid result
 */
export function createValid(file, line, message) {
  return createResult(file, line, null, message, "info", "valid");
}

export default {
  ValidationResult,
  FileValidationResult,
  BaseValidator,
  createResult,
  createError,
  createWarning,
  createValid,
};
