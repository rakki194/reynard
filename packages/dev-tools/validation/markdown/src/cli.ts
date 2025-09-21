#!/usr/bin/env node

/**
 * 🦊 Markdown Validation CLI
 *
 * Command-line interface for markdown validation tools
 */

import fs from "fs";
import path from "path";
import { ToCValidator } from "./toc-validator.js";
import { LinksValidator } from "./links-validator.js";
import { SentenceLengthValidator } from "./sentence-length-validator.js";
import type { ToCValidationOptions, LinkValidationOptions, SentenceLengthOptions } from "./types.js";

// Simple colors for output
const colors = {
  success: "\x1b[32m", // Green
  error: "\x1b[31m", // Red
  warning: "\x1b[33m", // Yellow
  info: "\x1b[34m", // Blue
  highlight: "\x1b[36m", // Cyan
  dim: "\x1b[90m", // Gray
  reset: "\x1b[0m", // Reset
};

export function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}

export function printColored(message: string, color: string = colors.reset): void {
  console.log(colorize(message, color));
}

export function showHelp(): void {
  console.log(`
🦊 Markdown Validation Tools

Usage: markdown-validator <command> [options] <file>

Commands:
  toc <file>              Validate Table of Contents
  links <file>            Validate links
  sentence-length <file>  Validate sentence length
  test-conflict           Test ToC conflict detection

Options:
  --fix                   Automatically fix issues
  --verbose               Verbose output
  --max-length <number>   Maximum sentence length (default: 100)
  --external              Check external links (default: true)
  --internal              Check internal links (default: true)

Examples:
  markdown-validator toc README.md --fix
  markdown-validator links README.md --verbose
  markdown-validator sentence-length README.md --max-length 80 --fix
  markdown-validator test-conflict
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    return;
  }

  const command = args[0];
  const file = args[1];

  try {
    switch (command) {
      case "toc":
        await handleToCCommand(args.slice(1));
        break;
      case "links":
        await handleLinksCommand(args.slice(1));
        break;
      case "sentence-length":
        await handleSentenceLengthCommand(args.slice(1));
        break;
      case "test-conflict":
        await handleTestConflictCommand(args.slice(1));
        break;
      default:
        printColored(`❌ Unknown command: ${command}`, colors.error);
        printColored("💡 Use --help to see available commands", colors.info);
        process.exit(1);
    }
  } catch (error) {
    printColored(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, colors.error);
    process.exit(1);
  }
}

export async function handleToCCommand(args: string[]): Promise<void> {
  // Find the file argument (first non-option argument)
  const file = args.find(arg => !arg.startsWith("--"));
  const options: ToCValidationOptions = {
    fix: args.includes("--fix"),
    verbose: args.includes("--verbose"),
    detectConflicts: true,
  };

  if (!file) {
    printColored("❌ File path required for toc command", colors.error);
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    printColored(`❌ File not found: ${file}`, colors.error);
    process.exit(1);
  }

  printColored(`🦊 Validating ToC in: ${file}`, colors.info);

  const validator = new ToCValidator();
  const result = await validator.validateFile(file, options);

  if (result.success) {
    printColored("✅ ToC validation passed", colors.success);
    if (result.fixes && result.fixes.length > 0) {
      printColored("🔧 Fixes applied:", colors.info);
      result.fixes.forEach(fix => printColored(`  - ${fix}`, colors.dim));
    }
  } else {
    printColored(`❌ ToC validation failed: ${result.error}`, colors.error);
    if (options.fix && result.fixes && result.fixes.length > 0) {
      printColored("🔧 Fixes applied:", colors.info);
      result.fixes.forEach(fix => printColored(`  - ${fix}`, colors.dim));
    } else if (!options.fix) {
      printColored("💡 Use --fix flag to automatically fix issues", colors.warning);
    }
    process.exit(1);
  }
}

export async function handleLinksCommand(args: string[]): Promise<void> {
  // Find the file argument (first non-option argument)
  const file = args.find(arg => !arg.startsWith("--"));
  const options: LinkValidationOptions = {
    checkExternal: !args.includes("--no-external"),
    checkInternal: !args.includes("--no-internal"),
    verbose: args.includes("--verbose"),
  };

  if (!file) {
    printColored("❌ File path required for links command", colors.error);
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    printColored(`❌ File not found: ${file}`, colors.error);
    process.exit(1);
  }

  printColored(`🦊 Validating links in: ${file}`, colors.info);

  const validator = new LinksValidator();
  const result = await validator.validateFile(file, options);

  if (result.success) {
    printColored("✅ Link validation passed", colors.success);
    if (result.warnings && result.warnings.length > 0) {
      printColored("⚠️  Warnings:", colors.warning);
      result.warnings.forEach(warning => printColored(`  - ${warning}`, colors.dim));
    }
  } else {
    printColored(`❌ Link validation failed: ${result.error}`, colors.error);
    process.exit(1);
  }

  // Show link statistics
  const content = fs.readFileSync(file, "utf8");
  const stats = validator.getLinkStats(content);
  printColored(`📊 Link Statistics:`, colors.info);
  printColored(`  Total links: ${stats.total}`, colors.dim);
  printColored(`  Internal: ${stats.internal}`, colors.dim);
  printColored(`  External: ${stats.external}`, colors.dim);
  printColored(`  Anchors: ${stats.anchors}`, colors.dim);
}

export async function handleSentenceLengthCommand(args: string[]): Promise<void> {
  // Find the file argument (first non-option argument)
  const file = args.find(arg => !arg.startsWith("--"));
  const maxLengthIndex = args.indexOf("--max-length");
  const maxLength = maxLengthIndex !== -1 && args[maxLengthIndex + 1] ? parseInt(args[maxLengthIndex + 1]) : 100;

  const options: SentenceLengthOptions = {
    maxLength,
    fix: args.includes("--fix"),
    verbose: args.includes("--verbose"),
  };

  if (!file) {
    printColored("❌ File path required for sentence-length command", colors.error);
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    printColored(`❌ File not found: ${file}`, colors.error);
    process.exit(1);
  }

  printColored(`🦊 Validating sentence length in: ${file}`, colors.info);
  printColored(`Max length: ${maxLength} characters`, colors.dim);

  const validator = new SentenceLengthValidator();
  const result = await validator.validateFile(file, options);

  if (result.success) {
    printColored("✅ Sentence length validation passed", colors.success);
    if (result.fixes && result.fixes.length > 0) {
      printColored("🔧 Fixes applied:", colors.info);
      result.fixes.forEach(fix => printColored(`  - ${fix}`, colors.dim));
    }
  } else {
    printColored(`❌ Sentence length validation failed: ${result.error}`, colors.error);
    if (options.fix && result.fixes && result.fixes.length > 0) {
      printColored("🔧 Fixes applied:", colors.info);
      result.fixes.forEach(fix => printColored(`  - ${fix}`, colors.dim));
    } else if (!options.fix) {
      printColored("💡 Use --fix flag to automatically fix long sentences", colors.warning);
    }
    process.exit(1);
  }

  // Show sentence statistics
  const content = fs.readFileSync(file, "utf8");
  const stats = validator.getSentenceStats(content);
  printColored(`📊 Sentence Statistics:`, colors.info);
  printColored(`  Total sentences: ${stats.total}`, colors.dim);
  printColored(`  Average length: ${stats.averageLength} chars`, colors.dim);
  printColored(`  Max length: ${stats.maxLength} chars`, colors.dim);
  printColored(`  Long sentences (>${stats.longSentenceThreshold}): ${stats.longSentences}`, colors.dim);
}

export async function handleTestConflictCommand(args: string[]): Promise<void> {
  const options: ToCValidationOptions = {
    verbose: args.includes("--verbose"),
    detectConflicts: true,
  };

  const validator = new ToCValidator();
  const testFilePath = path.join(process.cwd(), ".vscode/test-toc-conflict.md");

  printColored("🦊 Running ToC conflict detection test...", colors.highlight);
  await validator.runConflictTest(testFilePath, options);
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    printColored(`❌ Uncaught error: ${error.message}`, colors.error);
    process.exit(1);
  });
}

export default main;
