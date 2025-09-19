#!/usr/bin/env node
/**
 * Markdown Table of Contents Validation Script for Reynard Framework
 *
 * This script validates that all markdown files in backend/, docs/, and src/ directories
 * have a proper Table of Contents (ToC) under the first H2 heading and that the ToC
 * is up-to-date with the actual headings in the document.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import {
  Colors,
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
 * Parse markdown content and extract headings
 * @param {string} content - Markdown file content
 * @returns {Array} Array of heading objects with level, text, and line number
 */
function extractHeadings(content) {
  const lines = content.split("\n");
  const headings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);

    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({
        level,
        text,
        lineNumber: i + 1,
        raw: line,
      });
    }
  }

  return headings;
}

/**
 * Generate a Table of Contents from headings
 * @param {Array} headings - Array of heading objects
 * @param {number} startLevel - Starting heading level (default: 2)
 * @returns {string} Generated ToC markdown
 */
function generateToC(headings, startLevel = 2) {
  if (headings.length === 0) {
    return "";
  }

  // Filter headings at or below the start level, excluding ToC headings
  const relevantHeadings = headings.filter(
    h =>
      h.level >= startLevel &&
      !h.text.toLowerCase().includes("table of contents") &&
      !h.text.toLowerCase().includes("toc")
  );

  if (relevantHeadings.length === 0) {
    return "";
  }

  const tocLines = ["## Table of Contents", ""];

  // Group headings by their hierarchy
  const headingGroups = [];
  let currentGroup = null;

  for (const heading of relevantHeadings) {
    if (heading.level === startLevel) {
      // Start a new group
      if (currentGroup) {
        headingGroups.push(currentGroup);
      }
      currentGroup = {
        main: heading,
        subs: [],
      };
    } else if (currentGroup && heading.level > startLevel) {
      // Add as sub-heading
      currentGroup.subs.push(heading);
    }
  }

  // Add the last group
  if (currentGroup) {
    headingGroups.push(currentGroup);
  }

  // Generate ToC entries
  for (const group of headingGroups) {
    const anchor = generateAnchor(group.main.text);
    tocLines.push(`- [${group.main.text}](#${anchor})`);

    // Add sub-headings
    for (const sub of group.subs) {
      const subAnchor = generateAnchor(sub.text);
      const indent = "  ".repeat(sub.level - startLevel);
      tocLines.push(`${indent}- [${sub.text}](#${subAnchor})`);
    }
  }

  return tocLines.join("\n");
}

/**
 * Generate an anchor link from heading text
 * @param {string} text - Heading text
 * @returns {string} Anchor link
 */
function generateAnchor(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extract existing ToC from markdown content
 * @param {string} content - Markdown file content
 * @returns {Object} ToC information
 */
function extractExistingToC(content) {
  const lines = content.split("\n");
  let tocStart = -1;
  let tocEnd = -1;
  let tocContent = "";

  // Find ToC section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^##\s+table\s+of\s+contents$/i)) {
      tocStart = i;
      break;
    }
  }

  if (tocStart === -1) {
    return { found: false, content: "", startLine: -1, endLine: -1 };
  }

  // Find end of ToC (next heading or end of file)
  for (let i = tocStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^#{1,6}\s+/)) {
      tocEnd = i;
      break;
    }
  }

  if (tocEnd === -1) {
    tocEnd = lines.length;
  }

  tocContent = lines.slice(tocStart, tocEnd).join("\n");

  return {
    found: true,
    content: tocContent,
    startLine: tocStart + 1,
    endLine: tocEnd,
  };
}

/**
 * Check if existing ToC is up to date
 * @param {string} existingToC - Existing ToC content
 * @param {string} expectedToC - Expected ToC content
 * @returns {boolean} True if ToC is up to date
 */
function isToCUpToDate(existingToC, expectedToC) {
  // Normalize both ToCs for comparison
  const normalize = toc => {
    return toc
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s-]/g, "")
      .trim();
  };

  const normalizedExisting = normalize(existingToC);
  const normalizedExpected = normalize(expectedToC);

  return normalizedExisting === normalizedExpected;
}

/**
 * Validate a single markdown file for ToC
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} Result object with success status and issues found
 */
function validateMarkdownFile(filePath) {
  try {
    const content = safeReadFile(filePath);
    if (!content) {
      return {
        success: false,
        issues: [],
        needsFix: false,
        error: "Could not read file",
      };
    }

    const headings = extractHeadings(content);
    const existingToC = extractExistingToC(content);
    const expectedToC = generateToC(headings);
    const issues = [];

    // Check if ToC exists
    if (!existingToC.found) {
      if (headings.length > 1) {
        issues.push({
          type: "missing",
          message: "Table of Contents is missing",
          suggestion: "Add a Table of Contents section after the first heading",
        });
      }
    } else {
      // Check if ToC is up to date
      if (!isToCUpToDate(existingToC.content, expectedToC)) {
        issues.push({
          type: "outdated",
          message: "Table of Contents is outdated",
          suggestion: "Update the Table of Contents to match current headings",
        });
      }
    }

    return {
      success: true,
      issues,
      needsFix: issues.length > 0,
      existingToC,
      expectedToC,
    };
  } catch (error) {
    printError(`Error processing ${filePath}: ${error.message}`);
    return {
      success: false,
      issues: [],
      needsFix: false,
      error: error.message,
    };
  }
}

/**
 * Auto-fix ToC issues in a markdown file
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} Result object with success status and changes made
 */
function autoFixToC(filePath) {
  try {
    const content = safeReadFile(filePath);
    if (!content) {
      return {
        success: false,
        modified: false,
        changesCount: 0,
        error: "Could not read file",
      };
    }

    const headings = extractHeadings(content);
    const existingToC = extractExistingToC(content);
    const expectedToC = generateToC(headings);

    if (expectedToC === "") {
      return {
        success: true,
        modified: false,
        changesCount: 0,
      };
    }

    let newContent = content;
    let changesCount = 0;

    if (!existingToC.found) {
      // Insert ToC after first heading
      const lines = content.split("\n");
      let insertIndex = 0;

      // Find first heading
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^#{1,6}\s+/)) {
          insertIndex = i + 1;
          break;
        }
      }

      // Insert ToC
      lines.splice(insertIndex, 0, "", expectedToC, "");
      newContent = lines.join("\n");
      changesCount = 1;
    } else {
      // Replace existing ToC
      const lines = content.split("\n");
      const beforeToC = lines.slice(0, existingToC.startLine - 1);
      const afterToC = lines.slice(existingToC.endLine);
      newContent = [...beforeToC, expectedToC, "", ...afterToC].join("\n");
      changesCount = 1;
    }

    if (newContent !== content) {
      const writeSuccess = safeWriteFile(filePath, newContent);
      if (!writeSuccess) {
        return {
          success: false,
          modified: false,
          changesCount: 0,
          error: "Could not write file",
        };
      }
    }

    return {
      success: true,
      modified: newContent !== content,
      changesCount,
    };
  } catch (error) {
    printError(`Error fixing ${filePath}: ${error.message}`);
    return {
      success: false,
      modified: false,
      changesCount: 0,
      error: error.message,
    };
  }
}

/**
 * Main validation function
 * @param {Array} files - Array of file paths to validate (optional, defaults to staged files)
 * @param {boolean} fix - Whether to apply fixes
 * @returns {boolean} True if all validations pass
 */
function validateMarkdownToC(files = null, fix = false) {
  const filesToCheck = files || getStagedMarkdownFiles();

  if (filesToCheck.length === 0) {
    printSuccess("No markdown files staged for commit");
    return true;
  }

  const action = fix ? "Fixing" : "Validating";
  printHeader(`${action} Table of Contents in ${filesToCheck.length} markdown file(s):`);
  for (const file of filesToCheck) {
    printColored(`  - ${file}`, Colors.CYAN);
  }
  printColored("", Colors.NC);

  let allValid = true;
  let totalIssues = 0;
  const results = [];

  for (const file of filesToCheck) {
    printColored(`📄 Processing: ${file}`, Colors.BLUE);

    let result;
    if (fix) {
      result = autoFixToC(file);
    } else {
      result = validateMarkdownFile(file);
    }

    results.push({ file, ...result });

    if (!result.success) {
      allValid = false;
    } else if (fix) {
      if (result.modified) {
        printSuccess(`  Fixed Table of Contents`);
        totalIssues += result.changesCount;
      } else {
        printSuccess(`  Table of Contents is already up to date`);
      }
    } else {
      if (result.issues && result.issues.length > 0) {
        allValid = false;
        totalIssues += result.issues.length;

        for (const issue of result.issues) {
          printWarning(`  ${issue.message}`);
          if (issue.suggestion) {
            printColored(`    💡 ${issue.suggestion}`, Colors.YELLOW);
          }
        }
      } else {
        printSuccess(`  Table of Contents is valid`);
      }
    }
    printColored("", Colors.NC);
  }

  // Summary
  if (fix) {
    if (totalIssues > 0) {
      printSuccess(`Successfully fixed Table of Contents in ${totalIssues} file(s)!`);
    } else {
      printSuccess("All Table of Contents are already up to date.");
    }
  } else {
    if (totalIssues > 0) {
      printWarning(`Found ${totalIssues} Table of Contents issues.`);
      printWarning("   Run with --fix to automatically fix them.");
    } else {
      printSuccess("All Table of Contents are valid!");
    }
  }

  return allValid;
}

// Command line interface
function main() {
  const args = parseCommonArgs();

  if (args.help) {
    showHelp(
      "Table of Contents Validator for Reynard Framework",
      "Validates and fixes Table of Contents in markdown files to ensure they are present and up-to-date.",
      {
        examples: ["node validate-markdown-toc.js", "node validate-markdown-toc.js --fix"],
        notes: [
          "This script ensures all markdown files have proper Table of Contents sections.",
          "It automatically generates ToC entries from document headings.",
        ],
      }
    );
  }

  const success = validateMarkdownToC(null, args.fix);
  handleExit(success, args.strict, 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { autoFixToC, validateMarkdownFile, validateMarkdownToC };
