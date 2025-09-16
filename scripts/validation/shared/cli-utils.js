#!/usr/bin/env node
/**
 * Shared CLI Utilities for Reynard Validation Scripts
 *
 * Provides common command-line argument parsing, help generation,
 * and process management utilities.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import { Colors, printColored, printHeader } from "./colors.js";

/**
 * Common CLI argument patterns
 */
export const COMMON_ARGS = {
  FIX: "--fix",
  ALL: "--all",
  HELP: "--help",
  VERBOSE: "--verbose",
  STRICT: "--strict",
  STAGED: "--staged",
};

/**
 * Parse common CLI arguments
 * @param {string[]} args - Process arguments (default: process.argv.slice(2))
 * @returns {Object} Parsed arguments object
 */
export function parseCommonArgs(args = process.argv.slice(2)) {
  return {
    fix: args.includes(COMMON_ARGS.FIX),
    all: args.includes(COMMON_ARGS.ALL),
    help: args.includes(COMMON_ARGS.HELP) || args.includes("-h"),
    verbose: args.includes(COMMON_ARGS.VERBOSE),
    strict: args.includes(COMMON_ARGS.STRICT),
    staged: args.includes(COMMON_ARGS.STAGED),
    args: args,
  };
}

/**
 * Generate help text for validation scripts
 * @param {string} scriptName - Name of the script
 * @param {string} description - Script description
 * @param {Object} options - Help options
 * @param {string[]} options.examples - Example commands
 * @param {string[]} options.notes - Additional notes
 * @returns {string} Formatted help text
 */
export function generateHelp(scriptName, description, options = {}) {
  const { examples = [], notes = [] } = options;

  let help = "";
  help += printHeader(`${scriptName}`, "🦊");
  help += "\n";
  help += `${description}\n`;
  help += "\n";
  help += "Usage:\n";
  help += `  node ${scriptName} [options]\n`;
  help += "\n";
  help += "Options:\n";
  help += `  ${COMMON_ARGS.FIX}     Apply fixes automatically\n`;
  help += `  ${COMMON_ARGS.ALL}     Process all files (default: staged files only)\n`;
  help += `  ${COMMON_ARGS.VERBOSE} Show detailed output\n`;
  help += `  ${COMMON_ARGS.STRICT}  Fail on warnings (for CI/CD)\n`;
  help += `  ${COMMON_ARGS.HELP}    Show this help message\n`;

  if (examples.length > 0) {
    help += "\n";
    help += "Examples:\n";
    examples.forEach((example) => {
      help += `  ${example}\n`;
    });
  }

  if (notes.length > 0) {
    help += "\n";
    help += "Notes:\n";
    notes.forEach((note) => {
      help += `  ${note}\n`;
    });
  }

  return help;
}

/**
 * Print help and exit
 * @param {string} scriptName - Name of the script
 * @param {string} description - Script description
 * @param {Object} options - Help options
 */
export function showHelp(scriptName, description, options = {}) {
  const help = generateHelp(scriptName, description, options);
  console.log(help);
  process.exit(0);
}

/**
 * Handle process exit with appropriate code
 * @param {boolean} success - Whether operation was successful
 * @param {boolean} strict - Whether to fail on warnings
 * @param {number} warningCount - Number of warnings
 */
export function handleExit(success, strict = false, warningCount = 0) {
  if (!success) {
    printColored("\n❌ Validation failed with errors", Colors.RED);
    process.exit(1);
  }

  if (strict && warningCount > 0) {
    printColored("\n⚠️ Validation failed due to warnings in strict mode", Colors.YELLOW);
    process.exit(1);
  }

  if (warningCount > 0) {
    printColored("\n⚠️ Validation passed with warnings", Colors.YELLOW);
    process.exit(0);
  }

  printColored("\n✅ Validation passed", Colors.GREEN);
  process.exit(0);
}

/**
 * Validate required dependencies
 * @param {Object} dependencies - Dependencies to check
 * @param {string[]} dependencies.commands - Commands to check
 * @param {string[]} dependencies.packages - Package names for installation hints
 * @returns {boolean} True if all dependencies are available
 */
export function validateDependencies(dependencies = {}) {
  const { commands = [], packages = [] } = dependencies;
  let allAvailable = true;

  for (const command of commands) {
    try {
      const { execSync } = require("child_process");
      execSync(`which ${command}`, { stdio: "ignore" });
      printColored(`✅ ${command} found`, Colors.GREEN);
    } catch {
      printColored(`❌ ${command} not found`, Colors.RED);
      allAvailable = false;
    }
  }

  if (!allAvailable && packages.length > 0) {
    printColored("\n💡 Install missing dependencies:", Colors.YELLOW);
    packages.forEach((pkg) => {
      printColored(`  sudo pacman -S ${pkg}`, Colors.CYAN);
    });
  }

  return allAvailable;
}

/**
 * Create a progress indicator
 * @param {string} message - Progress message
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @returns {string} Formatted progress string
 */
export function createProgressIndicator(message, current, total) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 20;
  const filledLength = Math.round((current / total) * barLength);
  const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

  return `${message} [${bar}] ${percentage}% (${current}/${total})`;
}

/**
 * Print progress indicator
 * @param {string} message - Progress message
 * @param {number} current - Current progress
 * @param {number} total - Total items
 */
export function printProgress(message, current, total) {
  const progress = createProgressIndicator(message, current, total);
  process.stdout.write(`\r${progress}`);

  if (current === total) {
    process.stdout.write("\n");
  }
}

/**
 * Measure execution time
 * @param {Function} fn - Function to measure
 * @param {string} description - Description for logging
 * @returns {*} Function result
 */
export async function measureTime(fn, description = "Operation") {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  printColored(`⏱️  ${description} completed in ${duration}ms`, Colors.CYAN);
  return result;
}

/**
 * Retry operation with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {*} Function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      printColored(`⚠️  Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, Colors.YELLOW);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default {
  parseCommonArgs,
  generateHelp,
  showHelp,
  handleExit,
  validateDependencies,
  createProgressIndicator,
  printProgress,
  measureTime,
  retryWithBackoff,
  COMMON_ARGS,
};
