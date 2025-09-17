#!/usr/bin/env node
/**
 * Test suite for Markdown Link Validator
 *
 * This test suite validates the markdown link validation functionality
 * using sample markdown files with various link types and scenarios.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MarkdownLinkValidator, LinkValidationResult, FileValidationResult } from "./validate-markdown-links.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("MarkdownLinkValidator", () => {
  let validator;
  let testDir;

  beforeAll(() => {
    validator = new MarkdownLinkValidator();
    testDir = path.join(__dirname, "test-markdown-files");

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

  describe("URL parsing", () => {
    it("should parse external URLs correctly", () => {
      const urlInfo = validator.parseUrl("https://example.com", "/test/file.md");

      expect(urlInfo.type).toBe("external");
      expect(urlInfo.url).toBe("https://example.com");
      expect(urlInfo.baseUrl).toBe("https://example.com");
      expect(urlInfo.fragment).toBeNull();
    });

    it("should parse external URLs with fragments", () => {
      const urlInfo = validator.parseUrl("https://example.com#section", "/test/file.md");

      expect(urlInfo.type).toBe("external");
      expect(urlInfo.url).toBe("https://example.com#section");
      expect(urlInfo.baseUrl).toBe("https://example.com");
      expect(urlInfo.fragment).toBe("section");
    });

    it("should parse anchor-only links", () => {
      const urlInfo = validator.parseUrl("#section", "/test/file.md");

      expect(urlInfo.type).toBe("anchor");
      expect(urlInfo.anchor).toBe("section");
    });

    it("should parse internal file links", () => {
      const urlInfo = validator.parseUrl("./other-file.md", "/test/file.md");

      expect(urlInfo.type).toBe("internal");
      expect(urlInfo.relativePath).toBe("./other-file.md");
      expect(urlInfo.path).toContain("other-file.md");
    });

    it("should parse internal file links with fragments", () => {
      const urlInfo = validator.parseUrl("./other-file.md#section", "/test/file.md");

      expect(urlInfo.type).toBe("internal");
      expect(urlInfo.relativePath).toBe("./other-file.md");
      expect(urlInfo.fragment).toBe("section");
    });
  });

  describe("Link extraction", () => {
    it("should extract markdown links", () => {
      const content = `
# Test Document

This is a [link to example](https://example.com) in the text.

Another [internal link](./other.md) here.
            `;

      const links = validator.extractLinks(content, "/test/file.md");

      expect(links).toHaveLength(2);
      expect(links[0].type).toBe("markdown");
      expect(links[0].url).toBe("https://example.com");
      expect(links[0].text).toBe("link to example");
      expect(links[1].type).toBe("markdown");
      expect(links[1].url).toBe("./other.md");
      expect(links[1].text).toBe("internal link");
    });

    it("should extract markdown images", () => {
      const content = `
# Test Document

![Alt text](./image.png)

![Another image](https://example.com/image.jpg)
            `;

      const links = validator.extractLinks(content, "/test/file.md");

      expect(links).toHaveLength(2);
      expect(links[0].type).toBe("image");
      expect(links[0].url).toBe("./image.png");
      expect(links[0].text).toBe("Alt text");
      expect(links[0].isImage).toBe(true);
      expect(links[1].type).toBe("image");
      expect(links[1].url).toBe("https://example.com/image.jpg");
      expect(links[1].text).toBe("Another image");
    });

    it("should extract auto-links", () => {
      const content = `
# Test Document

Visit <https://example.com> for more info.

Contact us at <mailto:test@example.com>.
            `;

      const links = validator.extractLinks(content, "/test/file.md");

      expect(links).toHaveLength(2);
      expect(links[0].type).toBe("auto");
      expect(links[0].url).toBe("https://example.com");
      expect(links[1].type).toBe("auto");
      expect(links[1].url).toBe("mailto:test@example.com");
    });

    it("should skip links in code blocks", () => {
      const content = `
# Test Document

This is a [link](https://example.com) outside code.

\`\`\`
This is [not a link](https://example.com) in code.
\`\`\`

Another [link](https://example.com) outside code.
            `;

      const links = validator.extractLinks(content, "/test/file.md");

      expect(links).toHaveLength(2);
      expect(links.every(link => link.url === "https://example.com")).toBe(true);
    });
  });

  describe("Anchor extraction", () => {
    it("should extract anchors from headings", () => {
      const content = `
# Main Title

## Section One

### Subsection A

## Section Two

#### Deep Section
            `;

      const anchors = validator.extractAnchors(content);

      expect(anchors.has("main-title")).toBe(true);
      expect(anchors.has("section-one")).toBe(true);
      expect(anchors.has("subsection-a")).toBe(true);
      expect(anchors.has("section-two")).toBe(true);
      expect(anchors.has("deep-section")).toBe(true);
    });

    it("should handle special characters in headings", () => {
      const content = `
# API Reference & Examples

## Getting Started (v2.0)

### Error Handling & Debugging
            `;

      const anchors = validator.extractAnchors(content);

      expect(anchors.has("api-reference-examples")).toBe(true);
      expect(anchors.has("getting-started-v20")).toBe(true);
      expect(anchors.has("error-handling-debugging")).toBe(true);
    });
  });

  describe("Link validation", () => {
    it("should validate external links", async () => {
      const link = {
        url: "https://example.com",
        line: 1,
        column: 1,
        type: "markdown",
        isImage: false,
      };

      const fileResult = new FileValidationResult("/test/file.md");
      const result = await validator.validateLink(link, "/test/file.md", fileResult);

      expect(result.type).toBe("external");
      expect(result.status).toBe("valid");
    });

    it("should detect invalid external URLs", async () => {
      const link = {
        url: "not-a-url",
        line: 1,
        column: 1,
        type: "markdown",
        isImage: false,
      };

      const fileResult = new FileValidationResult("/test/file.md");
      const result = await validator.validateLink(link, "/test/file.md", fileResult);

      expect(result.type).toBe("external");
      expect(result.status).toBe("error");
    });

    it("should validate anchor links", async () => {
      // Create a test file with content
      const testFile = path.join(testDir, "test-anchors.md");
      const content = `
# Main Title

## Section One

This is a [link to section](#section-one).
            `;

      fs.writeFileSync(testFile, content);

      const link = {
        url: "#section-one",
        line: 5,
        column: 1,
        type: "markdown",
        isImage: false,
      };

      const fileResult = new FileValidationResult(testFile);
      const result = await validator.validateLink(link, testFile, fileResult);

      expect(result.type).toBe("anchor");
      expect(result.status).toBe("valid");
    });

    it("should detect broken anchor links", async () => {
      // Create a test file with content
      const testFile = path.join(testDir, "test-broken-anchors.md");
      const content = `
# Main Title

## Section One

This is a [broken link](#nonexistent-section).
            `;

      fs.writeFileSync(testFile, content);

      const link = {
        url: "#nonexistent-section",
        line: 5,
        column: 1,
        type: "markdown",
        isImage: false,
      };

      const fileResult = new FileValidationResult(testFile);
      const result = await validator.validateLink(link, testFile, fileResult);

      expect(result.type).toBe("anchor");
      expect(result.status).toBe("broken");
    });

    it("should validate internal file links", async () => {
      // Create test files
      const testFile1 = path.join(testDir, "test-internal-1.md");
      const testFile2 = path.join(testDir, "test-internal-2.md");

      fs.writeFileSync(testFile1, "Content of file 1");
      fs.writeFileSync(
        testFile2,
        `
# Target File

## Target Section

This is the target content.
            `
      );

      const link = {
        url: "./test-internal-2.md",
        line: 1,
        column: 1,
        type: "markdown",
        isImage: false,
      };

      const fileResult = new FileValidationResult(testFile1);
      const result = await validator.validateLink(link, testFile1, fileResult);

      expect(result.type).toBe("internal");
      expect(result.status).toBe("valid");
    });

    it("should detect broken internal file links", async () => {
      const testFile = path.join(testDir, "test-broken-internal.md");
      fs.writeFileSync(testFile, "Content");

      const link = {
        url: "./nonexistent-file.md",
        line: 1,
        column: 1,
        type: "markdown",
        isImage: false,
      };

      const fileResult = new FileValidationResult(testFile);
      const result = await validator.validateLink(link, testFile, fileResult);

      expect(result.type).toBe("internal");
      expect(result.status).toBe("broken");
    });
  });

  describe("File validation result", () => {
    it("should track validation results correctly", () => {
      const fileResult = new FileValidationResult("/test/file.md");

      expect(fileResult.valid).toBe(true);
      expect(fileResult.errors).toHaveLength(0);
      expect(fileResult.warnings).toHaveLength(0);

      // Add a valid link
      const validResult = new LinkValidationResult(
        "/test/file.md",
        1,
        1,
        "https://example.com",
        "external",
        "valid",
        "Valid link"
      );
      fileResult.addLink(validResult);

      expect(fileResult.valid).toBe(true);
      expect(fileResult.errors).toHaveLength(0);
      expect(fileResult.warnings).toHaveLength(0);

      // Add a broken link
      const brokenResult = new LinkValidationResult(
        "/test/file.md",
        2,
        1,
        "./broken.md",
        "internal",
        "broken",
        "File not found"
      );
      fileResult.addLink(brokenResult);

      expect(fileResult.valid).toBe(false);
      expect(fileResult.errors).toHaveLength(1);
      expect(fileResult.warnings).toHaveLength(0);

      // Add a warning
      const warningResult = new LinkValidationResult(
        "/test/file.md",
        3,
        1,
        "http://example.com",
        "external",
        "warning",
        "Use HTTPS"
      );
      fileResult.addLink(warningResult);

      expect(fileResult.valid).toBe(false);
      expect(fileResult.errors).toHaveLength(1);
      expect(fileResult.warnings).toHaveLength(1);
    });
  });

  describe("Integration tests", () => {
    it("should validate a complete markdown file", async () => {
      // Create a comprehensive test file
      const testFile = path.join(testDir, "integration-test.md");
      const targetFile = path.join(testDir, "target.md");

      const content = `
# Integration Test

## Valid Links

- [External link](https://example.com)
- [Internal link](./target.md)
- [Anchor link](#valid-section)

## Invalid Links

- [Broken external](https://nonexistent-domain-12345.com)
- [Broken internal](./nonexistent.md)
- [Broken anchor](#nonexistent-section)

## Valid Section

This section exists for anchor testing.
            `;

      const targetContent = `
# Target File

This is the target file content.
            `;

      fs.writeFileSync(testFile, content);
      fs.writeFileSync(targetFile, targetContent);

      const fileResult = new FileValidationResult(testFile);
      const content_loaded = validator.loadMarkdownFile(testFile);
      const links = validator.extractLinks(content_loaded, testFile);

      expect(links).toHaveLength(6);

      // Validate all links
      for (const link of links) {
        const result = await validator.validateLink(link, testFile, fileResult);
        fileResult.addLink(result);
      }

      // Should have 3 valid links and 3 broken links
      expect(fileResult.valid).toBe(false);
      expect(fileResult.errors).toHaveLength(3);
      expect(fileResult.warnings).toHaveLength(0);
    });
  });
});

describe("LinkValidationResult", () => {
  it("should create validation results correctly", () => {
    const result = new LinkValidationResult(
      "/test/file.md",
      10,
      5,
      "https://example.com",
      "external",
      "valid",
      "Link is valid"
    );

    expect(result.file).toBe("/test/file.md");
    expect(result.line).toBe(10);
    expect(result.column).toBe(5);
    expect(result.link).toBe("https://example.com");
    expect(result.type).toBe("external");
    expect(result.status).toBe("valid");
    expect(result.message).toBe("Link is valid");
    expect(result.suggestion).toBeNull();
    expect(result.timestamp).toBeDefined();
  });

  it("should handle suggestions", () => {
    const result = new LinkValidationResult(
      "/test/file.md",
      10,
      5,
      "http://example.com",
      "external",
      "warning",
      "Use HTTPS",
      "Consider using https://example.com instead"
    );

    expect(result.suggestion).toBe("Consider using https://example.com instead");
  });
});

describe("FileValidationResult", () => {
  it("should initialize correctly", () => {
    const result = new FileValidationResult("/test/file.md");

    expect(result.file).toBe("/test/file.md");
    expect(result.links).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.valid).toBe(true);
  });
});
