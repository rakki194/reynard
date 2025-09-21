/**
 * 🦊 Tests for Links Validator
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { LinksValidator } from "../links-validator.js";

describe("LinksValidator", () => {
  let validator: LinksValidator;
  let testDir: string;

  beforeEach(() => {
    validator = new LinksValidator();
    testDir = path.join(process.cwd(), `.test-temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("extractLinks", () => {
    it("should extract all types of links", () => {
      const content = `# Test Document

[Internal Link](./other-file.md)
[External Link](https://example.com)
[Anchor Link](#section-1)
[Link with text](https://example.com "title")
`;

      const links = validator["extractLinks"](content);

      expect(links).toHaveLength(4);
      expect(links[0]).toEqual({
        text: "Internal Link",
        url: "./other-file.md",
        isExternal: false,
        isAnchor: false,
      });
      expect(links[1]).toEqual({
        text: "External Link",
        url: "https://example.com",
        isExternal: true,
        isAnchor: false,
      });
      expect(links[2]).toEqual({
        text: "Anchor Link",
        url: "#section-1",
        isExternal: false,
        isAnchor: true,
      });
    });
  });

  describe("validateAnchorLink", () => {
    it("should validate existing anchor links", () => {
      const content = `# Test Document

## Section 1

Content here.

## Section 2

More content here.
`;

      const result = validator["validateAnchorLink"]("#section-1", content);
      expect(result.valid).toBe(true);
    });

    it("should reject non-existent anchor links", () => {
      const content = `# Test Document

## Section 1

Content here.
`;

      const result = validator["validateAnchorLink"]("#non-existent", content);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Anchor target not found");
    });
  });

  describe("validateFileLink", () => {
    it("should validate existing file links", () => {
      const testFile = path.join(testDir, "test.md");
      fs.writeFileSync(testFile, "test content", "utf8");

      const result = validator["validateFileLink"]("test.md", testDir);
      expect(result.valid).toBe(true);
    });

    it("should reject non-existent file links", () => {
      const result = validator["validateFileLink"]("non-existent.md", testDir);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("File not found");
    });
  });

  describe("validateContent", () => {
    it("should validate content with valid links", async () => {
      const content = `# Test Document

## Section 1

[Link to section](#section-1)
[External link](https://example.com)

## Section 2

More content.
`;

      const result = await validator.validateContent(content, "test.md");
      expect(result.success).toBe(true);
    });

    it("should detect invalid anchor links", async () => {
      const content = `# Test Document

[Invalid anchor](#non-existent)

## Section 1

Content here.
`;

      const result = await validator.validateContent(content, "test.md");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid anchor link");
    });
  });

  describe("validateFile", () => {
    it("should validate file with valid links", async () => {
      const testFile = path.join(testDir, "test.md");
      const content = `# Test Document

## Section 1

[Link to section](#section-1)

## Section 2

More content.
`;

      fs.writeFileSync(testFile, content, "utf8");

      const result = await validator.validateFile(testFile);
      expect(result.success).toBe(true);
    });

    it("should handle non-existent file", async () => {
      const nonExistentFile = path.join(testDir, "non-existent.md");

      const result = await validator.validateFile(nonExistentFile);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to read file");
    });
  });

  describe("getLinkStats", () => {
    it("should return correct link statistics", () => {
      const content = `# Test Document

[Internal](./file.md)
[External](https://example.com)
[Anchor](#section)

## Section

Content.
`;

      const stats = validator.getLinkStats(content);

      expect(stats.total).toBe(3);
      expect(stats.internal).toBe(2);
      expect(stats.external).toBe(1);
      expect(stats.anchors).toBe(1);
    });
  });

  describe("error handling", () => {
    it("should handle file validation errors", async () => {
      const result = await validator.validateFile("nonexistent.md", {
        checkExternal: true,
        checkInternal: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to read file");
    });

    it("should validate internal file links with relative paths", async () => {
      const testFilePath = path.join(testDir, "test-links.md");
      const content = `# Test

[Link to other file](./other-file.md)
[Link to parent](../parent.md)`;

      fs.writeFileSync(testFilePath, content);

      const result = await validator.validateFile(testFilePath, {
        checkExternal: false,
        checkInternal: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("File not found");
    });

    it("should validate internal file links with absolute paths", async () => {
      const testFilePath = path.join(testDir, "test-links.md");
      const content = `# Test

[Link to absolute file](/absolute/path.md)`;

      fs.writeFileSync(testFilePath, content);

      const result = await validator.validateFile(testFilePath, {
        checkExternal: false,
        checkInternal: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid file link");
    });
  });
});
