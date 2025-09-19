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
  const breakPoints = findOptimalBreakPoints(line, maxLength);

  if (breakPoints.length === 0) {
    return breakAtWordBoundary(line, maxLength);
  }

  const bestBreak = breakPoints[0];
  const indent = getIndentation(line);
  const firstPart = line.substring(0, bestBreak.position);
  const secondPart = line.substring(bestBreak.position).trim();

  return `${firstPart}\n${indent}${secondPart}`;
}

/**
 * Create a break point object
 * @param {number} position - Position in the line
 * @param {number} score - Quality score (higher is better)
 * @param {string} type - Type of break point
 * @param {string} word - Word at the break point
 * @param {number} maxLength - Maximum line length
 * @returns {Object} Break point object
 */
function createBreakPoint(position, score, type, word, maxLength) {
  return {
    position,
    score,
    type,
    word,
    // Prefer breaks that result in more balanced line lengths
    balanceScore: Math.abs(position - maxLength / 2),
  };
}

/**
 * Find conjunction break points (and, or, but, etc.)
 * @param {string} line - Line to analyze
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Array of break points
 */
function findConjunctionBreakPoints(line, maxLength) {
  const conjunctions = [
    /\s+and\s+/gi,
    /\s+or\s+/gi,
    /\s+but\s+/gi,
    /\s+yet\s+/gi,
    /\s+so\s+/gi,
    /\s+for\s+/gi,
    /\s+nor\s+/gi,
  ];

  const breakPoints = [];

  for (const pattern of conjunctions) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const position = match.index + match[0].length;
      if (position < maxLength && position > maxLength * 0.3) {
        breakPoints.push(createBreakPoint(position, 8, "conjunction", match[0].trim(), maxLength));
      }
    }
  }

  return breakPoints;
}

/**
 * Find punctuation break points
 * @param {string} line - Line to analyze
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Array of break points
 */
function findPunctuationBreakPoints(line, maxLength) {
  const breakPoints = [];

  // Semicolons (high priority)
  const semicolonMatches = line.matchAll(/;\s+/g);
  for (const match of semicolonMatches) {
    const position = match.index + match[0].length;
    if (position < maxLength && position > maxLength * 0.2) {
      breakPoints.push(createBreakPoint(position, 9, "semicolon", ";", maxLength));
    }
  }

  // Commas (medium priority)
  const commaMatches = line.matchAll(/,\s+/g);
  for (const match of commaMatches) {
    const position = match.index + match[0].length;
    if (position < maxLength && position > maxLength * 0.3) {
      breakPoints.push(createBreakPoint(position, 6, "comma", ",", maxLength));
    }
  }

  // Colons (medium priority)
  const colonMatches = line.matchAll(/:\s+/g);
  for (const match of colonMatches) {
    const position = match.index + match[0].length;
    if (position < maxLength && position > maxLength * 0.2) {
      breakPoints.push(createBreakPoint(position, 7, "colon", ":", maxLength));
    }
  }

  return breakPoints;
}

/**
 * Find preposition break points
 * @param {string} line - Line to analyze
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Array of break points
 */
function findPrepositionBreakPoints(line, maxLength) {
  const prepositions = [
    /\s+in\s+/gi,
    /\s+on\s+/gi,
    /\s+at\s+/gi,
    /\s+to\s+/gi,
    /\s+for\s+/gi,
    /\s+of\s+/gi,
    /\s+with\s+/gi,
    /\s+by\s+/gi,
    /\s+from\s+/gi,
    /\s+about\s+/gi,
    /\s+into\s+/gi,
    /\s+through\s+/gi,
    /\s+during\s+/gi,
    /\s+before\s+/gi,
    /\s+after\s+/gi,
    /\s+above\s+/gi,
    /\s+below\s+/gi,
    /\s+between\s+/gi,
    /\s+among\s+/gi,
  ];

  const breakPoints = [];

  for (const pattern of prepositions) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const position = match.index + match[0].length;
      if (position < maxLength && position > maxLength * 0.4) {
        breakPoints.push(createBreakPoint(position, 5, "preposition", match[0].trim(), maxLength));
      }
    }
  }

  return breakPoints;
}

/**
 * Find relative clause break points
 * @param {string} line - Line to analyze
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Array of break points
 */
function findRelativeBreakPoints(line, maxLength) {
  const relatives = [/\s+which\s+/gi, /\s+that\s+/gi, /\s+who\s+/gi, /\s+where\s+/gi];

  const breakPoints = [];

  for (const pattern of relatives) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const position = match.index + match[0].length;
      if (position < maxLength && position > maxLength * 0.3) {
        breakPoints.push(createBreakPoint(position, 6, "relative", match[0].trim(), maxLength));
      }
    }
  }

  return breakPoints;
}

/**
 * Sort break points by quality score
 * @param {Array} breakPoints - Array of break points
 * @returns {Array} Sorted break points
 */
function sortBreakPoints(breakPoints) {
  return breakPoints.sort((a, b) => {
    // Primary sort by score (higher is better)
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    // Secondary sort by balance (closer to maxLength/2 is better)
    return a.balanceScore - b.balanceScore;
  });
}

/**
 * Find optimal break points for a line
 * @param {string} line - Line to analyze
 * @param {number} maxLength - Maximum line length
 * @returns {Array} Sorted array of break points
 */
function findOptimalBreakPoints(line, maxLength) {
  const breakPoints = [
    ...findConjunctionBreakPoints(line, maxLength),
    ...findPunctuationBreakPoints(line, maxLength),
    ...findPrepositionBreakPoints(line, maxLength),
    ...findRelativeBreakPoints(line, maxLength),
  ];

  return sortBreakPoints(breakPoints);
}

/**
 * Break at word boundary as fallback
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
      continue;
    }

    if (currentLine) {
      result.push(currentLine);
      currentLine = indent + word;
    } else {
      // Single word is too long, break it
      result.push(word);
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
 * @param {string} filePath - Path to the markdown file
 * @param {number} maxLength - Maximum line length (default: 120)
 * @returns {Object} Result object with success status and issues found
 */
function validateSentenceLength(filePath, maxLength = 120) {
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

    const lines = content.split("\n");
    const issues = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      if (line.length > maxLength) {
        const context = lines.slice(0, i);
        if (!isSpecialMarkdownElement(line, context)) {
          issues.push({
            line: lineNumber,
            length: line.length,
            content: line.substring(0, 50) + (line.length > 50 ? "..." : ""),
            suggestion: "Break this line to improve readability",
          });
        }
      }
    }

    return {
      success: true,
      issues,
      needsFix: issues.length > 0,
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
 * Auto-fix sentence length issues in a markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {number} maxLength - Maximum line length (default: 120)
 * @returns {Object} Result object with success status and changes made
 */
function autoFixSentenceLength(filePath, maxLength = 120) {
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

    const originalContent = content;
    const fixedContent = breakLongSentences(content, maxLength);
    const modified = originalContent !== fixedContent;

    if (modified) {
      const writeSuccess = safeWriteFile(filePath, fixedContent);
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
      modified,
      changesCount: modified ? 1 : 0,
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
 * @param {number} maxLength - Maximum line length
 * @param {boolean} allFiles - Whether to process all markdown files
 * @param {boolean} fix - Whether to apply fixes
 * @returns {boolean} True if all validations pass
 */
function validateSentenceLengths(files = null, maxLength = 120, allFiles = false, fix = false) {
  const filesToCheck = files || (allFiles ? getAllMarkdownFiles() : getStagedMarkdownFiles());

  if (filesToCheck.length === 0) {
    if (allFiles) {
      printSuccess("No markdown files found in project");
    } else {
      printSuccess("No markdown files staged for commit");
    }
    return true;
  }

  const action = fix ? "Fixing" : "Validating";
  printHeader(`${action} sentence length in ${filesToCheck.length} markdown file(s):`);
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
      result = autoFixSentenceLength(file, maxLength);
    } else {
      result = validateSentenceLength(file, maxLength);
    }

    results.push({ file, ...result });

    if (!result.success) {
      allValid = false;
    } else if (fix) {
      if (result.modified) {
        printSuccess(`  Fixed sentence length issues`);
        totalIssues += result.changesCount;
      } else {
        printSuccess(`  No sentence length issues found`);
      }
    } else {
      if (result.issues && result.issues.length > 0) {
        allValid = false;
        totalIssues += result.issues.length;
        printWarning(`  Found ${result.issues.length} long lines`);

        for (const issue of result.issues.slice(0, 3)) {
          printColored(`    Line ${issue.line} (${issue.length} chars): ${issue.content}`, Colors.YELLOW);
        }

        if (result.issues.length > 3) {
          printColored(`    ... and ${result.issues.length - 3} more`, Colors.YELLOW);
        }
      } else {
        printSuccess(`  All lines are within ${maxLength} characters`);
      }
    }
    printColored("", Colors.NC);
  }

  // Summary
  if (fix) {
    if (totalIssues > 0) {
      printSuccess(`Successfully fixed sentence length issues in ${totalIssues} file(s)!`);
    } else {
      printSuccess("No sentence length issues found to fix.");
    }
  } else {
    if (totalIssues > 0) {
      printWarning(`Found ${totalIssues} long lines that should be broken up.`);
      printWarning("   Run with --fix to automatically break long lines.");
    } else {
      printSuccess("All lines are within the recommended length!");
    }
  }

  return allValid;
}

// Command line interface
function main() {
  const args = parseCommonArgs();

  if (args.help) {
    showHelp(
      "Sentence Length Validator for Reynard Framework",
      "Validates and fixes sentence length in markdown files to maintain readability and comply with line length limits.",
      {
        examples: [
          "node validate-sentence-length.js",
          "node validate-sentence-length.js --fix",
          "node validate-sentence-length.js --fix --all",
        ],
        notes: [
          "This script implements 2025 best practices for technical documentation sentence breaking.",
          "It intelligently breaks lines at conjunctions, punctuation, and prepositions.",
        ],
      }
    );
  }

  const success = validateSentenceLengths(null, 120, args.all, args.fix);
  handleExit(success, args.strict, 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { autoFixSentenceLength, validateSentenceLength, validateSentenceLengths };
