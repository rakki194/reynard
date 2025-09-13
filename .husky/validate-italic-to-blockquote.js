#!/usr/bin/env node
/**
 * Italic to Blockquote Conversion Script for Reynard Framework
 *
 * This script converts italic text (*text*) to blockquotes (>text) in markdown files
 * to improve readability and visual hierarchy in documentation.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import fs from "fs";
import { execSync } from "child_process";

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
};

function printColored(message, color = Colors.NC) {
  console.log(`${color}${message}${Colors.NC}`);
}

/**
 * Convert italic text to blockquotes in a markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {boolean} fix - Whether to apply fixes
 * @returns {Object} Result object with success status and changes made
 */
function convertItalicToBlockquote(filePath, fix = false) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modified = false;
    let changesCount = 0;
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check if line starts with * and contains italic text (but not bold text)
      if (trimmedLine.startsWith("*") && trimmedLine.endsWith("*") && trimmedLine.length > 2) {
        // Extract the text between the asterisks
        const italicText = trimmedLine.slice(1, -1);
        
        // Skip if it's already a blockquote, if it's just a single asterisk, or if it's bold text
        if (!italicText.startsWith(">") && italicText.length > 0 && !italicText.startsWith("*")) {
          if (fix) {
            // Convert to blockquote, preserving indentation
            const indentation = line.match(/^\s*/)[0];
            const newLine = `${indentation}> ${italicText}`;
            newLines.push(newLine);
            modified = true;
            changesCount++;
            printColored(`  🔄 Line ${i + 1}: "*${italicText}*" → "> ${italicText}"`, Colors.YELLOW);
          } else {
            // Just report the issue
            newLines.push(line);
            printColored(`  ⚠️  Line ${i + 1}: "*${italicText}*" should be "> ${italicText}"`, Colors.YELLOW);
            modified = true;
            changesCount++;
          }
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }

    if (fix && modified) {
      const newContent = newLines.join("\n");
      fs.writeFileSync(filePath, newContent, "utf8");
      printColored(`  ✅ Fixed ${changesCount} italic-to-blockquote conversion(s)`, Colors.GREEN);
    }

    return {
      success: true,
      modified,
      changesCount,
      needsFix: modified && !fix,
    };
  } catch (error) {
    printColored(`  ❌ Error processing ${filePath}: ${error.message}`, Colors.RED);
    return {
      success: false,
      modified: false,
      changesCount: 0,
      needsFix: false,
      error: error.message,
    };
  }
}

/**
 * Get staged markdown files
 * @returns {Array} Array of staged markdown file paths
 */
function getStagedMarkdownFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" });
    return output
      .split("\n")
      .filter((file) => file.trim() && file.endsWith(".md"))
      .map((file) => file.trim());
  } catch (error) {
    printColored(`Error getting staged files: ${error.message}`, Colors.RED);
    return [];
  }
}

/**
 * Get all markdown files in the project
 * @returns {Array} Array of all markdown file paths
 */
function getAllMarkdownFiles() {
  try {
    const output = execSync("find . -name '*.md' -not -path './node_modules/*' -not -path './third_party/*' -not -path './backend/venv/*'", { encoding: "utf8" });
    return output
      .split("\n")
      .filter((file) => file.trim())
      .map((file) => file.trim());
  } catch (error) {
    printColored(`Error getting all markdown files: ${error.message}`, Colors.RED);
    return [];
  }
}

/**
 * Main validation function
 * @param {Array} files - Array of file paths to validate (optional, defaults to staged files)
 * @param {boolean} allFiles - Whether to process all markdown files
 * @param {boolean} fix - Whether to apply fixes
 * @returns {boolean} True if all validations pass
 */
function validateItalicToBlockquote(files = null, allFiles = false, fix = false) {
  const filesToCheck = files || (allFiles ? getAllMarkdownFiles() : getStagedMarkdownFiles());

  if (filesToCheck.length === 0) {
    if (allFiles) {
      printColored("✅ No markdown files found in project", Colors.GREEN);
    } else {
      printColored("✅ No markdown files staged for commit", Colors.GREEN);
    }
    return true;
  }

  const action = fix ? "Converting" : "Validating";
  printColored(
    `🦊 ${action} italic-to-blockquote in ${filesToCheck.length} markdown file(s):`,
    Colors.PURPLE,
  );
  for (const file of filesToCheck) {
    printColored(`  - ${file}`, Colors.CYAN);
  }
  printColored("", Colors.NC);

  let allValid = true;
  let totalChanges = 0;
  const results = [];

  for (const file of filesToCheck) {
    printColored(`📄 Processing: ${file}`, Colors.BLUE);
    const result = convertItalicToBlockquote(file, fix);
    results.push({ file, ...result });

    if (!result.success) {
      allValid = false;
    } else if (result.needsFix) {
      allValid = false;
      totalChanges += result.changesCount;
    } else if (result.modified && fix) {
      totalChanges += result.changesCount;
    }

    if (result.success && !result.modified) {
      printColored(`  ✅ No italic-to-blockquote conversions needed`, Colors.GREEN);
    }
    printColored("", Colors.NC);
  }

  // Summary
  if (fix) {
    if (totalChanges > 0) {
      printColored(`🦊 Successfully converted ${totalChanges} italic text(s) to blockquotes!`, Colors.GREEN);
    } else {
      printColored(`🦊 No italic-to-blockquote conversions needed.`, Colors.GREEN);
    }
  } else {
    if (totalChanges > 0) {
      printColored(`🦊 Found ${totalChanges} italic text(s) that should be converted to blockquotes.`, Colors.YELLOW);
      printColored(`   Run with --fix to automatically convert them.`, Colors.YELLOW);
    } else {
      printColored(`🦊 All italic text formatting is correct!`, Colors.GREEN);
    }
  }

  return allValid;
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const fix = args.includes("--fix");
  const allFiles = args.includes("--all");
  const help = args.includes("--help") || args.includes("-h");

  if (help) {
    printColored("🦊 Italic to Blockquote Converter for Reynard Framework", Colors.PURPLE);
    printColored("", Colors.NC);
    printColored("Usage:", Colors.WHITE);
    printColored("  node .husky/validate-italic-to-blockquote.js [options]", Colors.CYAN);
    printColored("", Colors.NC);
    printColored("Options:", Colors.WHITE);
    printColored("  --fix     Apply fixes automatically", Colors.CYAN);
    printColored("  --all     Process all markdown files (default: staged files only)", Colors.CYAN);
    printColored("  --help    Show this help message", Colors.CYAN);
    printColored("", Colors.NC);
    printColored("Examples:", Colors.WHITE);
    printColored("  node .husky/validate-italic-to-blockquote.js", Colors.CYAN);
    printColored("  node .husky/validate-italic-to-blockquote.js --fix", Colors.CYAN);
    printColored("  node .husky/validate-italic-to-blockquote.js --fix --all", Colors.CYAN);
    printColored("", Colors.NC);
    printColored("🦊 This script converts italic text (*text*) to blockquotes (>text) in markdown files.", Colors.PURPLE);
    return;
  }

  const success = validateItalicToBlockquote(null, allFiles, fix);
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateItalicToBlockquote, convertItalicToBlockquote };
