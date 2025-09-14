#!/usr/bin/env node
/**
 * Shared Color System for Reynard Validation Scripts
 *
 * Provides consistent terminal colors and output formatting across all validation tools.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

// ANSI Color Codes
export const Colors = {
  RED: "\u001b[0;31m",
  GREEN: "\u001b[0;32m",
  YELLOW: "\u001b[1;33m",
  BLUE: "\u001b[0;34m",
  PURPLE: "\u001b[0;35m",
  CYAN: "\u001b[0;36m",
  WHITE: "\u001b[1;37m",
  NC: "\u001b[0m", // No Color
};

/**
 * Print a colored message to the console
 * @param {string} message - Message to print
 * @param {string} color - Color to use (default: no color)
 */
export function printColored(message, color = Colors.NC) {
  console.log(`${color}${message}${Colors.NC}`);
}

/**
 * Print a success message
 * @param {string} message - Success message
 */
export function printSuccess(message) {
  printColored(`✅ ${message}`, Colors.GREEN);
}

/**
 * Print an error message
 * @param {string} message - Error message
 */
export function printError(message) {
  printColored(`❌ ${message}`, Colors.RED);
}

/**
 * Print a warning message
 * @param {string} message - Warning message
 */
export function printWarning(message) {
  printColored(`⚠️  ${message}`, Colors.YELLOW);
}

/**
 * Print an info message
 * @param {string} message - Info message
 */
export function printInfo(message) {
  printColored(`ℹ️  ${message}`, Colors.BLUE);
}

/**
 * Print a header with consistent styling
 * @param {string} title - Header title
 * @param {string} emoji - Optional emoji prefix
 */
export function printHeader(title, emoji = "🦊") {
  printColored(`${emoji} ${title}`, Colors.PURPLE);
  printColored("=".repeat(title.length + 3), Colors.CYAN);
}

/**
 * Print a section separator
 * @param {string} title - Section title
 */
export function printSection(title) {
  printColored("", Colors.NC);
  printColored(`📊 ${title}`, Colors.PURPLE);
  printColored("=".repeat(30), Colors.CYAN);
}

export default Colors;
