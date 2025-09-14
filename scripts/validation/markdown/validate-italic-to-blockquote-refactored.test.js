#!/usr/bin/env node
/**
 * Test suite for Italic to Blockquote Validator (Refactored)
 *
 * This test suite validates the italic-to-blockquote conversion functionality
 * using sample markdown files with various italic text scenarios.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { convertItalicToBlockquote, validateItalicToBlockquote } from "./validate-italic-to-blockquote-refactored.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Italic to Blockquote Validator (Refactored)", () => {
  let testDir;

  beforeAll(() => {
    testDir = path.join(__dirname, "test-italic-files");

    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("convertItalicToBlockquote", () => {
    it("should convert simple italic text to blockquote", () => {
      const testFile = path.join(testDir, "simple-italic.md");
      const content = `# Test Document

*This is italic text that should be converted*

Regular paragraph text.

*Another italic line*

Normal text.`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is italic text that should be converted");
      expect(modifiedContent).toContain("> Another italic line");
      expect(modifiedContent).not.toContain("*This is italic text that should be converted*");
      expect(modifiedContent).not.toContain("*Another italic line*");
    });

    it("should preserve indentation when converting", () => {
      const testFile = path.join(testDir, "indented-italic.md");
      const content = `# Test Document

    *This is indented italic text*

Regular text.

        *This is more indented italic text*

Normal text.`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("    > This is indented italic text");
      expect(modifiedContent).toContain("        > This is more indented italic text");
    });

    it("should not convert bold text", () => {
      const testFile = path.join(testDir, "bold-text.md");
      const content = `# Test Document

**This is bold text and should not be converted**

*This is italic text and should be converted*

***This is bold italic text and should not be converted***

*This is another italic line*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2); // Only the two italic lines

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("**This is bold text and should not be converted**");
      expect(modifiedContent).toContain("***This is bold italic text and should not be converted***");
      expect(modifiedContent).toContain("> This is italic text and should be converted");
      expect(modifiedContent).toContain("> This is another italic line");
    });

    it("should not convert single asterisks", () => {
      const testFile = path.join(testDir, "single-asterisk.md");
      const content = `# Test Document

*This is italic text*

*This is just a single asterisk*

*This is another italic line*

*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2); // Only the two proper italic lines

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is italic text");
      expect(modifiedContent).toContain("> This is another italic line");
      expect(modifiedContent).toContain("*This is just a single asterisk*");
      expect(modifiedContent).toContain("*");
    });

    it("should not convert text that's already a blockquote", () => {
      const testFile = path.join(testDir, "already-blockquote.md");
      const content = `# Test Document

> This is already a blockquote

*This is italic text that should be converted*

> Another existing blockquote

*Another italic line*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2); // Only the two italic lines

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is already a blockquote");
      expect(modifiedContent).toContain("> Another existing blockquote");
      expect(modifiedContent).toContain("> This is italic text that should be converted");
      expect(modifiedContent).toContain("> Another italic line");
    });

    it("should handle empty files", () => {
      const testFile = path.join(testDir, "empty.md");
      fs.writeFileSync(testFile, "");

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
    });

    it("should handle files with no italic text", () => {
      const testFile = path.join(testDir, "no-italic.md");
      const content = `# Test Document

This is regular text.

**This is bold text**

> This is a blockquote

Normal paragraph.`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
    });

    it("should handle file read errors gracefully", () => {
      const nonExistentFile = path.join(testDir, "non-existent.md");

      const result = convertItalicToBlockquote(nonExistentFile, true);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
    });
  });

  describe("validateItalicToBlockquote", () => {
    it("should validate files with italic text", () => {
      const testFile = path.join(testDir, "validate-italic.md");
      const content = `# Test Document

*This is italic text that should be flagged*

Regular paragraph.

*Another italic line*

Normal text.`;

      fs.writeFileSync(testFile, content);

      const result = validateItalicToBlockquote(testFile);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(2);
      expect(result.needsFix).toBe(true);
      expect(result.issues[0].line).toBe(3);
      expect(result.issues[1].line).toBe(7);
    });

    it("should validate files with no italic text", () => {
      const testFile = path.join(testDir, "validate-no-italic.md");
      const content = `# Test Document

This is regular text.

**This is bold text**

> This is a blockquote

Normal paragraph.`;

      fs.writeFileSync(testFile, content);

      const result = validateItalicToBlockquote(testFile);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });

    it("should handle file read errors gracefully", () => {
      const nonExistentFile = path.join(testDir, "non-existent-validate.md");

      const result = validateItalicToBlockquote(nonExistentFile);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.issues).toHaveLength(0);
      expect(result.needsFix).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle mixed content with various markdown elements", () => {
      const testFile = path.join(testDir, "mixed-content.md");
      const content = `# Test Document

*This is italic text*

## Section

**This is bold text**

*Another italic line*

### Subsection

> This is a blockquote

*Yet another italic line*

- List item 1
- List item 2

*Final italic line*

\`\`\`javascript
// Code block
const example = "code";
\`\`\`

*Italic after code block*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(5); // 5 italic lines

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is italic text");
      expect(modifiedContent).toContain("> Another italic line");
      expect(modifiedContent).toContain("> Yet another italic line");
      expect(modifiedContent).toContain("> Final italic line");
      expect(modifiedContent).toContain("> Italic after code block");
    });

    it("should handle files with only headers", () => {
      const testFile = path.join(testDir, "headers-only.md");
      const content = `# Header 1

## Header 2

### Header 3

#### Header 4`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
    });

    it("should handle files with only whitespace", () => {
      const testFile = path.join(testDir, "whitespace-only.md");
      const content = `   \n\n  \t  \n\n   `;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
    });

    it("should handle very long italic lines", () => {
      const testFile = path.join(testDir, "long-italic.md");
      const longItalicLine =
        "*" +
        "This is a very long italic line that contains a lot of text and should be converted to a blockquote properly. ".repeat(
          10
        ) +
        "*";
      const content = `# Test Document

${longItalicLine}

Regular text.`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(1);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is a very long italic line");
      expect(modifiedContent).not.toContain(longItalicLine);
    });
  });

  describe("Integration Tests", () => {
    it("should work with real markdown content", () => {
      const testFile = path.join(testDir, "real-content.md");
      const content = `# Reynard Framework Documentation

## Introduction

*The Reynard Framework is a comprehensive development platform that provides developers with powerful tools and utilities for building modern web applications.*

## Key Features

### Component System

*The framework includes a robust component system that allows developers to create reusable UI components with ease.*

### State Management

*State management in Reynard is handled through a sophisticated system that provides predictable state updates and excellent developer experience.*

## Getting Started

*To get started with Reynard, you'll need to install the framework and its dependencies.*

### Installation

\`\`\`bash
npm install reynard-framework
\`\`\`

*Once installed, you can start using Reynard in your projects.*

## Conclusion

*Reynard Framework provides developers with a comprehensive set of tools and utilities for building modern web applications.*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(6); // 6 italic lines in the content

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> The Reynard Framework is a comprehensive development platform");
      expect(modifiedContent).toContain("> The framework includes a robust component system");
      expect(modifiedContent).toContain("> State management in Reynard is handled through a sophisticated system");
      expect(modifiedContent).toContain("> To get started with Reynard, you'll need to install the framework");
      expect(modifiedContent).toContain("> Once installed, you can start using Reynard in your projects");
      expect(modifiedContent).toContain("> Reynard Framework provides developers with a comprehensive set of tools");
    });

    it("should validate real markdown content", () => {
      const testFile = path.join(testDir, "real-content-validate.md");
      const content = `# Reynard Framework Documentation

## Introduction

*The Reynard Framework is a comprehensive development platform that provides developers with powerful tools and utilities for building modern web applications.*

## Key Features

### Component System

*The framework includes a robust component system that allows developers to create reusable UI components with ease.*

### State Management

*State management in Reynard is handled through a sophisticated system that provides predictable state updates and excellent developer experience.*`;

      fs.writeFileSync(testFile, content);

      const result = validateItalicToBlockquote(testFile);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(3);
      expect(result.needsFix).toBe(true);
    });
  });
});
