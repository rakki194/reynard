#!/usr/bin/env node
/**
 * Italic to Blockquote Conversion Script for Reynard Framework
 *
 * This script converts italic text (*text*) to blockquotes (>text) in markdown files
 * to improve readability and visual hierarchy in documentation.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import {
  Colors,
  getAllMarkdownFiles,
  getStagedMarkdownFiles,
  handleExit,
  parseCommonArgs,
  printColored,
  printError,
  printHeader,
  printSuccess,
  printWarning,
  safeReadFile,
  safeWriteFile,
  showHelp,
} from "../shared/index.js";

/**
 * Convert italic text to blockquotes in a markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {boolean} fix - Whether to apply fixes
 * @returns {Object} Result object with success status and changes made
 */
function convertItalicToBlockquote(filePath, fix = false) {
  try {
    const content = safeReadFile(filePath);
    if (!content) {
      return {
        success: false,
        modified: false,
        changesCount: 0,
        needsFix: false,
        error: "Could not read file",
      };
    }

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
      const writeSuccess = safeWriteFile(filePath, newContent);
      if (writeSuccess) {
        printSuccess(`  Fixed ${changesCount} italic-to-blockquote conversion(s)`);
      } else {
        return {
          success: false,
          modified: false,
          changesCount: 0,
          needsFix: false,
          error: "Could not write file",
        };
      }
    }

    return {
      success: true,
      modified,
      changesCount,
      needsFix: modified && !fix,
    };
  } catch (error) {
    printError(`  Error processing ${filePath}: ${error.message}`);
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
      printSuccess("No markdown files found in project");
    } else {
      printSuccess("No markdown files staged for commit");
    }
    return true;
  }

  const action = fix ? "Converting" : "Validating";
  printHeader(`${action} italic-to-blockquote in ${filesToCheck.length} markdown file(s):`);
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
      printSuccess("  No italic-to-blockquote conversions needed");
    }
    printColored("", Colors.NC);
  }

  // Summary
  if (fix) {
    if (totalChanges > 0) {
      printSuccess(`Successfully converted ${totalChanges} italic text(s) to blockquotes!`);
    } else {
      printSuccess("No italic-to-blockquote conversions needed.");
    }
  } else {
    if (totalChanges > 0) {
      printWarning(`Found ${totalChanges} italic text(s) that should be converted to blockquotes.`);
      printWarning("   Run with --fix to automatically convert them.");
    } else {
      printSuccess("All italic text formatting is correct!");
    }
  }

  return allValid;
}

// Command line interface
function main() {
  const args = parseCommonArgs();

  if (args.help) {
    showHelp(
      "Italic to Blockquote Converter for Reynard Framework",
      "Converts italic text (*text*) to blockquotes (>text) in markdown files for better readability.",
      {
        examples: [
          "node validate-italic-to-blockquote.js",
          "node validate-italic-to-blockquote.js --fix",
          "node validate-italic-to-blockquote.js --fix --all",
        ],
        notes: ["This script converts italic text (*text*) to blockquotes (>text) in markdown files."],
      }
    );
  }

  const success = validateItalicToBlockquote(null, args.all, args.fix);
  handleExit(success, args.strict, 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertItalicToBlockquote, validateItalicToBlockquote };
