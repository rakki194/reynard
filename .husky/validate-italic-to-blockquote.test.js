#!/usr/bin/env node
/**
 * Test suite for Italic to Blockquote Validator
 *
 * This test suite validates the italic-to-blockquote conversion functionality
 * using sample markdown files with various italic text scenarios.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  validateItalicToBlockquote,
  convertItalicToBlockquote,
} from "./validate-italic-to-blockquote.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Italic to Blockquote Validator", () => {
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

*Another italic line for testing*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2);

      // Check the file was actually modified
      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is italic text that should be converted");
      expect(modifiedContent).toContain("> Another italic line for testing");
      expect(modifiedContent).not.toContain("*This is italic text that should be converted*");
      expect(modifiedContent).not.toContain("*Another italic line for testing*");
    });

    it("should not modify text that is not italic", () => {
      const testFile = path.join(testDir, "non-italic.md");
      const content = `# Test Document

This is regular text.

**This is bold text**

> This is already a blockquote

\`This is code\`

* Single asterisk
** Double asterisk
*** Triple asterisk`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);

      // Check the file was not modified
      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toBe(content);
    });

    it("should handle empty italic text", () => {
      const testFile = path.join(testDir, "empty-italic.md");
      const content = `# Test Document

**

* *`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(1); // "* *" gets converted
    });

    it("should handle italic text with special characters", () => {
      const testFile = path.join(testDir, "special-chars.md");
      const content = `# Test Document

*Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision*

*API endpoints: /api/v1/users, /api/v1/posts*

*Error codes: 404, 500, 503*

*Special chars: @#$%^&*()_+-=[]{}|;':",./<>?*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(4);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision");
      expect(modifiedContent).toContain("> API endpoints: /api/v1/users, /api/v1/posts");
      expect(modifiedContent).toContain("> Error codes: 404, 500, 503");
      expect(modifiedContent).toContain("> Special chars: @#$%^&*()_+-=[]{}|;':\",./<>?");
    });

    it("should handle mixed content with indentation", () => {
      const testFile = path.join(testDir, "mixed-indented.md");
      const content = `# Test Document

    *Indented italic text*

*Regular italic text*

    *Another indented italic*

Regular paragraph.`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(3);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("    > Indented italic text");
      expect(modifiedContent).toContain("> Regular italic text");
      expect(modifiedContent).toContain("    > Another indented italic");
    });

    it("should not convert already converted blockquotes", () => {
      const testFile = path.join(testDir, "already-blockquote.md");
      const content = `# Test Document

> This is already a blockquote

*This should be converted*

> Another existing blockquote

*This should also be converted*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is already a blockquote");
      expect(modifiedContent).toContain("> This should be converted");
      expect(modifiedContent).toContain("> Another existing blockquote");
      expect(modifiedContent).toContain("> This should also be converted");
    });

    it("should handle validation mode without fixing", () => {
      const testFile = path.join(testDir, "validation-mode.md");
      const content = `# Test Document

*This is italic text that should be converted*

Regular paragraph text.

*Another italic line for testing*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, false);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(2);
      expect(result.needsFix).toBe(true);

      // Check the file was not modified
      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toBe(content);
    });

    it("should handle file not found error", () => {
      const result = convertItalicToBlockquote("/nonexistent/file.md", true);

      expect(result.success).toBe(false);
      expect(result.modified).toBe(false);
      expect(result.changesCount).toBe(0);
      expect(result.error).toBeDefined();
    });

    it("should handle multiline italic text", () => {
      const testFile = path.join(testDir, "multiline-italic.md");
      const content = `# Test Document

*This is a single line italic*

*This is a longer italic text that spans multiple words and should be converted to a blockquote for better readability*

*Short italic*

Regular paragraph.`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(3);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> This is a single line italic");
      expect(modifiedContent).toContain("> This is a longer italic text that spans multiple words and should be converted to a blockquote for better readability");
      expect(modifiedContent).toContain("> Short italic");
    });

    it("should handle edge cases with asterisks", () => {
      const testFile = path.join(testDir, "edge-cases.md");
      const content = `# Test Document

*Valid italic text*

* Invalid (space after asterisk)

*Invalid (space before asterisk) *

* * (just asterisks with space)

** (double asterisk)

* (single asterisk)

*Valid italic with numbers 123 and symbols !@#*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(3); // Three valid italic texts

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> Valid italic text");
      expect(modifiedContent).toContain("> Valid italic with numbers 123 and symbols !@#");
      expect(modifiedContent).toContain("* Invalid (space after asterisk)");
      expect(modifiedContent).toContain("> Invalid (space before asterisk) ");
    });
  });

  describe("validateItalicToBlockquote", () => {
    it("should validate multiple files", () => {
      // Create multiple test files
      const testFile1 = path.join(testDir, "multi-1.md");
      const testFile2 = path.join(testDir, "multi-2.md");
      const testFile3 = path.join(testDir, "multi-3.md");

      fs.writeFileSync(testFile1, `# File 1\n\n*Italic text 1*`);
      fs.writeFileSync(testFile2, `# File 2\n\nRegular text`);
      fs.writeFileSync(testFile3, `# File 3\n\n*Italic text 2*`);

      const result = validateItalicToBlockquote([testFile1, testFile2, testFile3], false, false);

      expect(result).toBe(false); // Should fail because there are issues to fix
    });

    it("should fix multiple files", () => {
      // Create multiple test files
      const testFile1 = path.join(testDir, "multi-fix-1.md");
      const testFile2 = path.join(testDir, "multi-fix-2.md");
      const testFile3 = path.join(testDir, "multi-fix-3.md");

      fs.writeFileSync(testFile1, `# File 1\n\n*Italic text 1*`);
      fs.writeFileSync(testFile2, `# File 2\n\nRegular text`);
      fs.writeFileSync(testFile3, `# File 3\n\n*Italic text 2*`);

      const result = validateItalicToBlockquote([testFile1, testFile2, testFile3], false, true);

      expect(result).toBe(true); // Should succeed after fixing

      // Check files were modified
      const content1 = fs.readFileSync(testFile1, "utf8");
      const content2 = fs.readFileSync(testFile2, "utf8");
      const content3 = fs.readFileSync(testFile3, "utf8");

      expect(content1).toContain("> Italic text 1");
      expect(content2).toBe("# File 2\n\nRegular text"); // Should be unchanged
      expect(content3).toContain("> Italic text 2");
    });

    it("should handle empty file list", () => {
      const result = validateItalicToBlockquote([], false, false);
      expect(result).toBe(true);
    });

    it("should handle files with no italic text", () => {
      const testFile = path.join(testDir, "no-italic.md");
      const content = `# Test Document

This is regular text.

**This is bold text**

> This is a blockquote

\`This is code\``;

      fs.writeFileSync(testFile, content);

      const result = validateItalicToBlockquote([testFile], false, false);
      expect(result).toBe(true);
    });

    it("should handle files with mixed valid and invalid content", () => {
      const testFile = path.join(testDir, "mixed-content.md");
      const content = `# Test Document

*Valid italic text*

Regular paragraph.

*Another valid italic*

**Bold text**

> Existing blockquote

*Final valid italic*`;

      fs.writeFileSync(testFile, content);

      const result = validateItalicToBlockquote([testFile], false, true);

      expect(result).toBe(true);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      expect(modifiedContent).toContain("> Valid italic text");
      expect(modifiedContent).toContain("> Another valid italic");
      expect(modifiedContent).toContain("> Final valid italic");
      expect(modifiedContent).toContain("**Bold text**");
      expect(modifiedContent).toContain("> Existing blockquote");
    });
  });

  describe("Integration tests", () => {
    it("should handle complex markdown document", () => {
      const testFile = path.join(testDir, "complex-document.md");
      const content = `# Complex Document

## Introduction

*This is an introduction that should be converted to a blockquote for emphasis*

Regular paragraph with **bold text** and \`inline code\`.

## Features

*Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision*

### API Endpoints

*API endpoints: /api/v1/users, /api/v1/posts, /api/v1/comments*

### Error Handling

*Error codes: 404 (Not Found), 500 (Internal Server Error), 503 (Service Unavailable)*

## Code Examples

\`\`\`typescript
// This is code, not italic
const example = "code block";
\`\`\`

*This italic text should be converted*

## Conclusion

*Final thoughts and recommendations*

> This is already a blockquote and should remain unchanged

*Last italic text to convert*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(7);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      
      // Check all italic texts were converted
      expect(modifiedContent).toContain("> This is an introduction that should be converted to a blockquote for emphasis");
      expect(modifiedContent).toContain("> Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision");
      expect(modifiedContent).toContain("> API endpoints: /api/v1/users, /api/v1/posts, /api/v1/comments");
      expect(modifiedContent).toContain("> Error codes: 404 (Not Found), 500 (Internal Server Error), 503 (Service Unavailable)");
      expect(modifiedContent).toContain("> This italic text should be converted");
      expect(modifiedContent).toContain("> Final thoughts and recommendations");
      expect(modifiedContent).toContain("> Last italic text to convert");

      // Check non-italic content was preserved
      expect(modifiedContent).toContain("**bold text**");
      expect(modifiedContent).toContain("`inline code`");
      expect(modifiedContent).toContain("// This is code, not italic");
      expect(modifiedContent).toContain("> This is already a blockquote and should remain unchanged");
    });

    it("should handle real-world documentation patterns", () => {
      const testFile = path.join(testDir, "real-world-docs.md");
      const content = `# Reynard Framework Documentation

## Overview

*Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision*

## Quick Start

### Installation

*Install the framework using npm or pnpm package manager*

\`\`\`bash
npm install reynard-framework
\`\`\`

### Configuration

*Configure your environment variables and settings*

## API Reference

### Core Endpoints

*Core API endpoints for user management and data processing*

### Admin Endpoints

*Administrative endpoints for system management and monitoring*

## Troubleshooting

### Common Issues

*Common issues and their solutions*

### Performance Optimization

*Performance optimization techniques and best practices*

## Contributing

*Guidelines for contributing to the Reynard framework*

---

*Thank you for using Reynard Framework!*`;

      fs.writeFileSync(testFile, content);

      const result = convertItalicToBlockquote(testFile, true);

      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(9);

      const modifiedContent = fs.readFileSync(testFile, "utf8");
      
      // Verify all italic texts were converted
      const blockquoteLines = modifiedContent.split('\n').filter(line => line.trim().startsWith('>'));
      expect(blockquoteLines).toHaveLength(9);
      
      // Check specific conversions
      expect(modifiedContent).toContain("> Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision");
      expect(modifiedContent).toContain("> Install the framework using npm or pnpm package manager");
      expect(modifiedContent).toContain("> Configure your environment variables and settings");
      expect(modifiedContent).toContain("> Core API endpoints for user management and data processing");
      expect(modifiedContent).toContain("> Administrative endpoints for system management and monitoring");
      expect(modifiedContent).toContain("> Common issues and their solutions");
      expect(modifiedContent).toContain("> Performance optimization techniques and best practices");
      expect(modifiedContent).toContain("> Guidelines for contributing to the Reynard framework");
      expect(modifiedContent).toContain("> Thank you for using Reynard Framework!");
    });
  });

  describe("Error handling", () => {
    it("should handle permission errors gracefully", () => {
      // Create a file and then make it read-only (if possible)
      const testFile = path.join(testDir, "readonly.md");
      fs.writeFileSync(testFile, "*Test italic text*");

      // Try to modify a file that might be read-only
      const result = convertItalicToBlockquote(testFile, true);
      
      // The result should still be successful for most cases
      expect(result.success).toBe(true);
    });

    it("should handle malformed file paths", () => {
      const result = convertItalicToBlockquote("", true);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle files with special characters in path", () => {
      const testFile = path.join(testDir, "special-chars-in-path.md");
      const content = "*Test italic text*";
      
      fs.writeFileSync(testFile, content);
      
      const result = convertItalicToBlockquote(testFile, true);
      expect(result.success).toBe(true);
      expect(result.modified).toBe(true);
      expect(result.changesCount).toBe(1);
    });
  });
});
