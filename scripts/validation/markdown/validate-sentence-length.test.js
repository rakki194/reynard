#!/usr/bin/env node
/**
 * Test Suite for Sentence Length Validation Script (Refactored)
 *
 * This test suite validates the sentence breaking functionality using
 * 2025 best practices for technical documentation.
 *
 * 🦦 The Playful Otter: Testing Virtuoso & Quality Guardian
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { autoFixSentenceLength, validateSentenceLength, validateSentenceLengths } from "./validate-sentence-length.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data directory
const testDataDir = path.join(__dirname, "test-data");
const tempDir = path.join(__dirname, "temp");

describe("Sentence Length Validation (Refactored)", () => {
  beforeEach(() => {
    // Create test directories
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp files
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
    }
  });

  describe("validateSentenceLength", () => {
    it("should validate a file with proper line lengths", () => {
      const testFile = path.join(tempDir, "valid.md");
      const content = `# Test Document

This is a short line.

This is a longer line that should be fine because it's under the limit.

## Another Section

More content here.`;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 120);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });

    it("should detect long lines", () => {
      const testFile = path.join(tempDir, "long-lines.md");
      const longLine =
        "This is a very long line that exceeds the maximum length limit and should be flagged as an issue that needs to be broken up into smaller, more manageable pieces.";
      const content = `# Test Document

${longLine}

This is a normal line.`;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 80);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(1);
      expect(result.needsFix).toBe(true);
      expect(result.issues[0].line).toBe(3);
      expect(result.issues[0].length).toBeGreaterThan(80);
    });

    it("should skip special markdown elements", () => {
      const testFile = path.join(tempDir, "special-elements.md");
      const content = `# Test Document

\`\`\`javascript
// This is a very long comment line that should not be broken because it's inside a code block and should be preserved as-is for proper code formatting
\`\`\`

| Column 1 | Column 2 | Column 3 | Column 4 | Column 5 | Column 6 | Column 7 | Column 8 | Column 9 | Column 10 |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|-----------|
| Data 1   | Data 2   | Data 3   | Data 4   | Data 5   | Data 6   | Data 7   | Data 8   | Data 9   | Data 10   |

- This is a very long list item that should not be broken because it's part of a list structure and breaking it would disrupt the list formatting

> This is a very long blockquote that should not be broken because it's a quote and should be preserved as-is

https://this-is-a-very-long-url-that-should-not-be-broken-because-it-would-break-the-link-functionality

<https://another-very-long-url-that-should-not-be-broken>

This is a normal paragraph that should be broken if it's too long.`;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 80);

      expect(result.success).toBe(true);
      // Should only flag the last paragraph, not the special elements
      expect(result.issues.length).toBeLessThanOrEqual(1);
    });

    it("should handle file read errors gracefully", () => {
      const nonExistentFile = path.join(tempDir, "non-existent.md");

      const result = validateSentenceLength(nonExistentFile, 120);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });
  });

  describe("autoFixSentenceLength", () => {
    it("should fix long lines by breaking them intelligently", () => {
      const testFile = path.join(tempDir, "fix-test.md");
      const longLine =
        "This is a very long line that should be broken at appropriate points like conjunctions, punctuation, and prepositions to improve readability.";
      const content = `# Test Document

${longLine}

This is a normal line.`;

      fs.writeFileSync(testFile, content);

      const result = autoFixSentenceLength(testFile, 80);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(1);

      // Check that the file was actually modified
      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).not.toContain(longLine);
      expect(modifiedContent).toContain("This is a very long line that should be broken");
    });

    it("should not modify files with no long lines", () => {
      const testFile = path.join(tempDir, "no-fix-needed.md");
      const content = `# Test Document

This is a short line.

This is another short line.

## Section

More short content.`;

      fs.writeFileSync(testFile, content);

      const result = autoFixSentenceLength(testFile, 120);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
    });

    it("should handle file write errors gracefully", () => {
      const testFile = path.join(tempDir, "write-error.md");
      const content = `# Test Document

This is a very long line that should be broken but we'll make the file read-only to test error handling.`;

      fs.writeFileSync(testFile, content);

      // Make file read-only
      fs.chmodSync(testFile, 0o444);

      const result = autoFixSentenceLength(testFile, 80);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);

      // Restore permissions for cleanup
      fs.chmodSync(testFile, 0o644);
    });
  });

  describe("validateSentenceLengths", () => {
    it("should validate multiple files", () => {
      const testFile1 = path.join(tempDir, "test1.md");
      const testFile2 = path.join(tempDir, "test2.md");

      const content1 = `# Test 1

Short line.`;

      const content2 = `# Test 2

This is a very long line that exceeds the maximum length limit and should be flagged as an issue.`;

      fs.writeFileSync(testFile1, content1);
      fs.writeFileSync(testFile2, content2);

      const result = validateSentenceLengths([testFile1, testFile2], 80, false, false);

      expect(result).toBe(false); // Should fail because testFile2 has long lines
    });

    it("should handle empty file list", () => {
      const result = validateSentenceLengths([], 120, false, false);

      expect(result).toBe(true); // Should pass with no files
    });

    it("should handle files with mixed results", () => {
      const testFile1 = path.join(tempDir, "good.md");
      const testFile2 = path.join(tempDir, "bad.md");
      const testFile3 = path.join(tempDir, "error.md");

      fs.writeFileSync(testFile1, "# Good\nShort line.");
      fs.writeFileSync(testFile2, "# Bad\nThis is a very long line that exceeds the maximum length limit.");
      // testFile3 doesn't exist, should cause an error

      const result = validateSentenceLengths([testFile1, testFile2, testFile3], 80, false, false);

      expect(result).toBe(false); // Should fail due to long lines and missing file
    });
  });

  describe("Edge Cases", () => {
    it("should handle files with only headers", () => {
      const testFile = path.join(tempDir, "headers-only.md");
      const content = `# Header 1

## Header 2

### Header 3

#### Header 4`;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 80);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });

    it("should handle empty files", () => {
      const testFile = path.join(tempDir, "empty.md");
      fs.writeFileSync(testFile, "");

      const result = validateSentenceLength(testFile, 80);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });

    it("should handle files with only whitespace", () => {
      const testFile = path.join(tempDir, "whitespace.md");
      const content = `   \n\n  \t  \n\n   `;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 80);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });

    it("should handle very long lines", () => {
      const testFile = path.join(tempDir, "very-long.md");
      const veryLongLine = "A".repeat(1000); // 1000 character line
      const content = `# Test

${veryLongLine}`;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 100);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].length).toBe(1000);
    });
  });

  describe("Integration Tests", () => {
    it("should work with real markdown content", () => {
      const testFile = path.join(tempDir, "real-content.md");
      const content = `# Reynard Framework Documentation

## Introduction

The Reynard Framework is a comprehensive development platform that provides developers with powerful tools and utilities for building modern web applications. It combines the best practices from various development methodologies to create a cohesive and efficient development experience.

## Key Features

### Component System

The framework includes a robust component system that allows developers to create reusable UI components with ease. These components are built using modern web standards and provide excellent performance and accessibility.

### State Management

State management in Reynard is handled through a sophisticated system that provides predictable state updates and excellent developer experience. The system is designed to scale with your application and provides tools for debugging and monitoring state changes.

### Build System

The build system is optimized for performance and provides fast compilation times while maintaining excellent output quality. It supports modern JavaScript features and provides excellent tree-shaking capabilities.

## Getting Started

To get started with Reynard, you'll need to install the framework and its dependencies. The installation process is straightforward and well-documented.

### Installation

\`\`\`bash
npm install reynard-framework
\`\`\`

### Basic Usage

Once installed, you can start using Reynard in your projects. The framework provides a simple API that makes it easy to get started while providing powerful features for advanced use cases.

## Conclusion

Reynard Framework provides developers with a comprehensive set of tools and utilities for building modern web applications. Its focus on developer experience and performance makes it an excellent choice for both small and large projects.`;

      fs.writeFileSync(testFile, content);

      const result = validateSentenceLength(testFile, 120);

      expect(result.success).toBe(true);
      // Should find some long lines in the real content
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fix real markdown content", () => {
      const testFile = path.join(tempDir, "real-content-fix.md");
      const content = `# Reynard Framework Documentation

## Introduction

The Reynard Framework is a comprehensive development platform that provides developers with powerful tools and utilities for building modern web applications. It combines the best practices from various development methodologies to create a cohesive and efficient development experience.

## Key Features

### Component System

The framework includes a robust component system that allows developers to create reusable UI components with ease. These components are built using modern web standards and provide excellent performance and accessibility.

### State Management

State management in Reynard is handled through a sophisticated system that provides predictable state updates and excellent developer experience. The system is designed to scale with your application and provides tools for debugging and monitoring state changes.`;

      fs.writeFileSync(testFile, content);

      const result = autoFixSentenceLength(testFile, 100);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);

      // Check that the content was actually modified
      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("# Reynard Framework Documentation");
      expect(modifiedContent).toContain("## Introduction");
    });
  });
});
