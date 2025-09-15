#!/usr/bin/env node
/**
 * Changelog Formatter
 * ===================
 *
 * Specialized formatter for CHANGELOG.md files that handles:
 * - MD032: Adding blank lines around lists
 * - MD013: Breaking long lines to fit within 120 character limit
 * - Maintaining proper markdown structure and readability
 */

const fs = require("fs");
const path = require("path");

class ChangelogFormatter {
  constructor(options = {}) {
    this.maxLineLength = options.maxLineLength || 120;
    this.verbose = options.verbose || false;
  }

  /**
   * Format a markdown file with changelog-specific rules
   */
  formatFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");
    const formatted = this.formatContent(content);

    if (this.verbose) {
      console.log(`📝 Formatted ${filePath}`);
    }

    return formatted;
  }

  /**
   * Format markdown content
   */
  formatContent(content) {
    const lines = content.split("\n");
    const formattedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = i > 0 ? lines[i - 1] : "";
      const nextLine = i < lines.length - 1 ? lines[i + 1] : "";

      // Skip multiple consecutive blank lines (MD012)
      if (line.trim() === "" && formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() === "") {
        continue;
      }

      // Handle blank lines around lists (MD032)
      const needsBlankBefore = this.needsBlankLineBefore(line, prevLine);
      const needsBlankAfter = this.needsBlankLineAfter(line, nextLine);

      // Only add blank line before if there isn't already one
      if (needsBlankBefore && formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() !== "") {
        formattedLines.push("");
      }

      // Handle line length (MD013)
      if (this.isListLine(line) && line.length > this.maxLineLength) {
        const wrappedLines = this.wrapListLine(line);
        formattedLines.push(...wrappedLines);
      } else {
        formattedLines.push(line);
      }

      // Only add blank line after if the next line isn't already blank
      if (needsBlankAfter && nextLine.trim() !== "") {
        formattedLines.push("");
      }
    }

    // Remove trailing blank lines and ensure single trailing newline
    while (formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() === "") {
      formattedLines.pop();
    }

    return formattedLines.join("\n") + "\n";
  }

  /**
   * Check if a line needs a blank line before it
   */
  needsBlankLineBefore(line, prevLine) {
    // List items need blank lines after headings (but not if there's already a blank line)
    if (this.isListLine(line) && this.isHeading(prevLine)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a line needs a blank line after it
   */
  needsBlankLineAfter(line, nextLine) {
    // Headings need blank lines before lists (but not if there's already a blank line)
    if (this.isHeading(line) && this.isListLine(nextLine)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a line is a list item
   */
  isListLine(line) {
    return /^\s*[-*+]\s/.test(line);
  }

  /**
   * Check if a line is a heading
   */
  isHeading(line) {
    return /^#{1,6}\s/.test(line);
  }

  /**
   * Wrap a long list line to fit within the character limit
   */
  wrapListLine(line) {
    if (line.length <= this.maxLineLength) {
      return [line];
    }

    const match = line.match(/^(\s*[-*+]\s)(.*)$/);
    if (!match) {
      return [line];
    }

    const [, prefix, content] = match;
    const indent = " ".repeat(prefix.length);
    const maxContentLength = this.maxLineLength - prefix.length;

    // Split content into words
    const words = content.split(" ");
    const wrappedLines = [];
    let currentLine = prefix;

    for (const word of words) {
      const testLine = currentLine + (currentLine === prefix ? "" : " ") + word;

      if (testLine.length <= this.maxLineLength) {
        currentLine = testLine;
      } else {
        if (currentLine !== prefix) {
          wrappedLines.push(currentLine);
          currentLine = indent + word;
        } else {
          // Single word is too long, just add it
          wrappedLines.push(testLine);
          currentLine = prefix;
        }
      }
    }

    if (currentLine !== prefix) {
      wrappedLines.push(currentLine);
    }

    return wrappedLines;
  }

  /**
   * Write formatted content to file
   */
  writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, "utf8");
    if (this.verbose) {
      console.log(`💾 Written formatted content to ${filePath}`);
    }
  }

  /**
   * Format file in place
   */
  formatFileInPlace(filePath) {
    const formatted = this.formatFile(filePath);
    this.writeFile(filePath, formatted);
    return formatted;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const verbose = args.includes("--verbose") || args.includes("-v");
  const checkOnly = args.includes("--check") || args.includes("-c");

  if (!filePath) {
    console.error("Usage: node changelog-formatter.js <file> [--verbose] [--check]");
    console.error("  --verbose, -v    Show verbose output");
    console.error("  --check, -c      Check only, don't modify file");
    process.exit(1);
  }

  try {
    const formatter = new ChangelogFormatter({ verbose });

    if (checkOnly) {
      const original = fs.readFileSync(filePath, "utf8");
      const formatted = formatter.formatContent(original);

      if (original === formatted) {
        console.log("✅ File is already properly formatted");
        process.exit(0);
      } else {
        console.log("❌ File needs formatting");
        process.exit(1);
      }
    } else {
      formatter.formatFileInPlace(filePath);
      console.log("✅ File formatted successfully");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

module.exports = ChangelogFormatter;
