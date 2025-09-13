#!/usr/bin/env node
/**
 * Sentence Length Validation Script for Reynard Framework
 *
 * This script validates that markdown files have properly broken sentences
 * to maintain readability and comply with line length limits. It implements
 * 2025 best practices for technical documentation sentence breaking.
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
 * Break up long sentences using 2025 best practices for technical documentation
 * @param {string} text - Text to break up
 * @param {number} maxLength - Maximum line length (default: 120)
 * @returns {string} Text with properly broken sentences
 */
function breakLongSentences(text, maxLength = 120) {
  const lines = text.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const context = lines.slice(0, i);

    if (line.length <= maxLength) {
      result.push(line);
      continue;
    }

    // Skip code blocks, tables, and other special markdown elements
    if (isSpecialMarkdownElement(line, context)) {
      result.push(line);
      continue;
    }

    const brokenLine = breakLineIntelligently(line, maxLength);
    result.push(brokenLine);
  }

  return result.join("\n");
}

/**
 * Check if a line is a special markdown element that shouldn't be broken
 * @param {string} line - Line to check
 * @param {Array} context - Array of previous lines for context
 * @returns {boolean} True if it's a special element
 */
function isSpecialMarkdownElement(line, context = []) {
  const trimmed = line.trim();

  // Check if we're inside a code block by counting opening/closing markers
  let inCodeBlock = false;
  for (const prevLine of context) {
    if (prevLine.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
    }
  }

  // Code blocks, tables, headers, lists, etc.
  return (
    inCodeBlock ||
    trimmed.startsWith("```") ||
    trimmed.startsWith("|") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("* ") ||
    trimmed.startsWith("+ ") ||
    trimmed.match(/^\d+\.\s/) ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("<") ||
    trimmed.startsWith("http") ||
    trimmed.startsWith("ftp") ||
    trimmed.match(/^[a-zA-Z0-9_-]+:\s*$/) // Key-value pairs
  );
}

/**
 * Break a line intelligently using sentence structure analysis
 * @param {string} line - Line to break
 * @param {number} maxLength - Maximum line length
 * @returns {string} Broken line
 */
function breakLineIntelligently(line, maxLength) {
  if (line.length <= maxLength) {
    return line;
  }

  // Find the best break points using 2025 best practices
  const breakPoints = findOptimalBreakPoints(line, maxLength);

  if (breakPoints.length === 0) {
    // Fallback: break at word boundaries
    return breakAtWordBoundary(line, maxLength);
  }

  // Use the best break point
  const bestBreak = breakPoints[0];
  const before = line.substring(0, bestBreak.position).trim();
  const after = line.substring(bestBreak.position).trim();

  // Add proper indentation for continuation
  const indent = getIndentation(line);
  const continuation = indent + after;

  const result = before + "\n" + continuation;

  // Recursively break the continuation if it's still too long
  if (continuation.length > maxLength) {
    const brokenContinuation = breakLineIntelligently(continuation, maxLength);
    return before + "\n" + brokenContinuation;
  }

  return result;
}

/**
 * Find optimal break points using sentence breaking best practices
 * @param {string} line - Line to analyze
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Array of break point objects with position and score
 */
function findOptimalBreakPoints(line, maxLength) {
  const breakPoints = [];

  // Priority 1: Conjunctions (and, but, while, because, etc.)
  const conjunctionPatterns = [
    /\s+(and|but|while|because|since|although|though|if|when|where|so|yet|or|nor)\s+/gi,
    /\s+(however|therefore|moreover|furthermore|nevertheless|consequently|additionally)\s+/gi,
  ];

  for (const pattern of conjunctionPatterns) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const position = match.index + match[0].length;
      if (position < maxLength && position > maxLength * 0.3) {
        breakPoints.push({
          position,
          score: 10,
          type: "conjunction",
          word: match[1],
        });
      }
    }
  }

  // Priority 2: Commas and semicolons
  const punctuationPatterns = [/,\s+/g, /;\s+/g];

  for (const pattern of punctuationPatterns) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const position = match.index + match[0].length;
      if (position < maxLength && position > maxLength * 0.3) {
        breakPoints.push({
          position,
          score: 8,
          type: "punctuation",
          char: match[0].trim(),
        });
      }
    }
  }

  // Priority 3: Prepositions (in, on, at, by, for, with, etc.)
  const prepositionPattern =
    /\s+(in|on|at|by|for|with|from|to|of|about|under|over|through|during|before|after|above|below|between|among|within|without|against|toward|towards|into|onto|upon|beneath|beyond|beside|besides|except|including|regarding|concerning|considering|given|provided|assuming|supposing)\s+/gi;

  let match;
  while ((match = prepositionPattern.exec(line)) !== null) {
    const position = match.index + match[0].length;
    if (position < maxLength && position > maxLength * 0.3) {
      breakPoints.push({
        position,
        score: 6,
        type: "preposition",
        word: match[1],
      });
    }
  }

  // Priority 4: Relative pronouns and subordinating conjunctions
  const relativePattern =
    /\s+(which|that|who|whom|whose|where|when|why|how|what|whoever|whomever|whatever|whichever|wherever|whenever|however)\s+/gi;

  while ((match = relativePattern.exec(line)) !== null) {
    const position = match.index + match[0].length;
    if (position < maxLength && position > maxLength * 0.3) {
      breakPoints.push({
        position,
        score: 7,
        type: "relative",
        word: match[1],
      });
    }
  }

  // Sort by score (highest first) and position (closest to maxLength)
  return breakPoints.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    // If scores are equal, prefer break points closer to maxLength
    const aDistance = Math.abs(a.position - maxLength);
    const bDistance = Math.abs(b.position - maxLength);
    return aDistance - bDistance;
  });
}

/**
 * Fallback method to break at word boundaries
 * @param {string} line - Line to break
 * @param {number} maxLength - Maximum line length
 * @returns {string} Broken line
 */
function breakAtWordBoundary(line, maxLength) {
  const words = line.split(" ");
  const result = [];
  let currentLine = "";
  const indent = getIndentation(line);

  for (const word of words) {
    if ((currentLine + " " + word).length <= maxLength) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) {
        result.push(currentLine);
        currentLine = indent + word;
      } else {
        // Single word is too long, break it
        result.push(word);
      }
    }
  }

  if (currentLine) {
    result.push(currentLine);
  }

  return result.join("\n");
}

/**
 * Get the indentation of a line
 * @param {string} line - Line to analyze
 * @returns {string} Indentation string
 */
function getIndentation(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : "";
}

/**
 * Validate a single markdown file for sentence length
 * @param {string} filePath - Path to markdown file
 * @param {number} maxLength - Maximum line length
 * @returns {Object} Validation result
 */
function validateSentenceLength(filePath, maxLength = 120) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const violations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      const context = lines.slice(0, i);

      if (line.length > maxLength && !isSpecialMarkdownElement(line, context)) {
        violations.push({
          line: lineNumber,
          length: line.length,
          content: line.trim(),
          suggestion: breakLineIntelligently(line, maxLength),
        });
      }
    }

    return {
      valid: violations.length === 0,
      file: filePath,
      violations,
      totalLines: lines.length,
      violationCount: violations.length,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to read file: ${error.message}`,
      file: filePath,
      line: 0,
    };
  }
}

/**
 * Auto-fix sentence length issues
 * @param {string} filePath - Path to markdown file
 * @param {number} maxLength - Maximum line length
 * @returns {Object} Fix result
 */
function autoFixSentenceLength(filePath, maxLength = 120) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fixedContent = breakLongSentences(content, maxLength);

    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, "utf8");
      return {
        success: true,
        file: filePath,
        fixed: true,
      };
    } else {
      return {
        success: true,
        file: filePath,
        fixed: false,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fix file: ${error.message}`,
      file: filePath,
    };
  }
}

/**
 * Get staged markdown files
 * @returns {Array} Array of staged markdown file paths
 */
function getStagedMarkdownFiles() {
  try {
    const stagedFiles = execSync(
      "git diff --cached --name-only --diff-filter=ACM",
      { encoding: "utf8" },
    );
    const allFiles = stagedFiles
      .trim()
      .split("\n")
      .filter((f) => f);

    return allFiles.filter((file) => file.endsWith(".md"));
  } catch (error) {
    printColored(`❌ Failed to get staged files: ${error.message}`, Colors.RED);
    return [];
  }
}

/**
 * Get all markdown files in the project, excluding specified directories
 * @returns {Array} Array of all markdown file paths
 */
function getAllMarkdownFiles() {
  try {
    const allFiles = execSync(
      'find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./third_party/*"',
      { encoding: "utf8" },
    );
    
    return allFiles
      .trim()
      .split("\n")
      .filter((f) => f && f.trim());
  } catch (error) {
    printColored(`❌ Failed to get all markdown files: ${error.message}`, Colors.RED);
    return [];
  }
}

/**
 * Main validation function
 * @param {Array} files - Array of file paths to validate (optional, defaults to staged files)
 * @param {number} maxLength - Maximum line length
 * @param {boolean} allFiles - Whether to process all markdown files
 * @returns {boolean} True if all validations pass
 */
function validateSentenceLengths(files = null, maxLength = 120, allFiles = false) {
  const filesToCheck = files || (allFiles ? getAllMarkdownFiles() : getStagedMarkdownFiles());

  if (filesToCheck.length === 0) {
    if (allFiles) {
      printColored("✅ No markdown files found in project", Colors.GREEN);
    } else {
      printColored("✅ No markdown files staged for commit", Colors.GREEN);
    }
    return true;
  }

  printColored(
    `🦊 Found ${filesToCheck.length} markdown file(s) to validate:`,
    Colors.PURPLE,
  );
  for (const file of filesToCheck) {
    printColored(`  - ${file}`, Colors.CYAN);
  }
  printColored("", Colors.NC);

  let allValid = true;
  const results = [];

  for (const file of filesToCheck) {
    const result = validateSentenceLength(file, maxLength);
    results.push(result);

    if (!result.valid) {
      allValid = false;
      printColored(
        `❌ ${file}: ${result.violationCount} line length violations found`,
        Colors.RED,
      );

      for (const violation of result.violations) {
        printColored(
          `   Line ${violation.line}: ${violation.length} characters`,
          Colors.YELLOW,
        );
        printColored(
          `   Content: ${violation.content.substring(0, 80)}${violation.content.length > 80 ? "..." : ""}`,
          Colors.CYAN,
        );
        printColored(`   Suggestion:`, Colors.BLUE);
        const suggestionLines = violation.suggestion.split("\n");
        for (const suggestionLine of suggestionLines) {
          printColored(`     ${suggestionLine}`, Colors.CYAN);
        }
        printColored("", Colors.NC);
      }
    } else {
      printColored(
        `✅ ${file}: All lines within ${maxLength} character limit`,
        Colors.GREEN,
      );
    }
  }

  if (!allValid) {
    printColored("\n💡 Tips:", Colors.YELLOW);
    printColored(
      "   - Break long sentences at conjunctions (and, but, while, because)",
      Colors.YELLOW,
    );
    printColored(
      "   - Use commas and semicolons as natural break points",
      Colors.YELLOW,
    );
    printColored("   - Break after prepositions when possible", Colors.YELLOW);
    printColored("   - Use relative pronouns as break points", Colors.YELLOW);
    printColored(
      '   - Run "node .husky/validate-sentence-length.js --fix" to auto-fix',
      Colors.YELLOW,
    );
    printColored(
      '   - Use "git commit --no-verify" to skip this check (not recommended)',
      Colors.YELLOW,
    );
  }

  return allValid;
}

/**
 * Auto-fix sentence length issues
 * @param {Array} files - Array of file paths to fix (optional, defaults to staged files)
 * @param {number} maxLength - Maximum line length
 * @param {boolean} allFiles - Whether to process all markdown files
 */
function autoFixSentenceLengths(files = null, maxLength = 120, allFiles = false) {
  const filesToCheck = files || (allFiles ? getAllMarkdownFiles() : getStagedMarkdownFiles());

  if (filesToCheck.length === 0) {
    if (allFiles) {
      printColored("✅ No markdown files found in project", Colors.GREEN);
    } else {
      printColored("✅ No markdown files to fix", Colors.GREEN);
    }
    return true;
  }

  printColored(
    `🦊 Auto-fixing sentence lengths in ${filesToCheck.length} markdown file(s):`,
    Colors.PURPLE,
  );

  let allFixed = true;

  for (const file of filesToCheck) {
    const result = autoFixSentenceLength(file, maxLength);

    if (!result.success) {
      printColored(`❌ ${file}: Failed to fix - ${result.error}`, Colors.RED);
      allFixed = false;
    } else if (result.fixed) {
      printColored(`✅ ${file}: Fixed sentence length issues`, Colors.GREEN);
    } else {
      printColored(`✅ ${file}: No fixes needed`, Colors.GREEN);
    }
  }

  return allFixed;
}

// CLI interface
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printColored("🦊 Reynard Sentence Length Validator", Colors.WHITE);
    printColored("=".repeat(50), Colors.CYAN);
    printColored("Usage:", Colors.BLUE);
    printColored("  node validate-sentence-length.js [options]", Colors.CYAN);
    printColored("", Colors.NC);
    printColored("Options:", Colors.BLUE);
    printColored("  --fix        Auto-fix sentence length issues", Colors.CYAN);
    printColored("  --all        Process all markdown files (skips node_modules, .git, third_party)", Colors.CYAN);
    printColored(
      "  --length N   Set maximum line length (default: 120)",
      Colors.CYAN,
    );
    printColored("  --help, -h   Show this help message", Colors.CYAN);
    printColored(
      "  <files>      Validate specific files instead of staged files",
      Colors.CYAN,
    );
    printColored("", Colors.NC);
    printColored("Examples:", Colors.BLUE);
    printColored("  node validate-sentence-length.js", Colors.CYAN);
    printColored("  node validate-sentence-length.js --fix", Colors.CYAN);
    printColored("  node validate-sentence-length.js --fix --all", Colors.CYAN);
    printColored(
      "  node validate-sentence-length.js --length 100",
      Colors.CYAN,
    );
    printColored(
      "  node validate-sentence-length.js docs/README.md",
      Colors.CYAN,
    );
    return 0;
  }

  // Parse max length
  let maxLength = 120;
  const lengthIndex = args.findIndex((arg) => arg === "--length");
  if (lengthIndex !== -1 && args[lengthIndex + 1]) {
    maxLength = parseInt(args[lengthIndex + 1], 10);
    if (isNaN(maxLength) || maxLength < 40) {
      printColored(
        "❌ Invalid length value. Must be a number >= 40",
        Colors.RED,
      );
      return 1;
    }
  }

  // Check for --all option
  const allFiles = args.includes("--all");
  
  if (args.includes("--fix")) {
    const files = args.filter(
      (arg) => !arg.startsWith("--") && arg !== maxLength.toString(),
    );
    return autoFixSentenceLengths(files.length > 0 ? files : null, maxLength, allFiles)
      ? 0
      : 1;
  } else {
    const files = args.filter(
      (arg) => !arg.startsWith("--") && arg !== maxLength.toString(),
    );
    return validateSentenceLengths(files.length > 0 ? files : null, maxLength, allFiles)
      ? 0
      : 1;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}

export {
  validateSentenceLengths,
  autoFixSentenceLengths,
  validateSentenceLength,
  autoFixSentenceLength,
  breakLongSentences,
  breakLineIntelligently,
  findOptimalBreakPoints,
};
