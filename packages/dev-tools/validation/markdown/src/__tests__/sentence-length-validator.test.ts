/**
 * 🦊 Tests for Sentence Length Validator
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { SentenceLengthValidator } from "../sentence-length-validator.js";

describe("SentenceLengthValidator", () => {
  let validator: SentenceLengthValidator;
  let testDir: string;

  beforeEach(() => {
    validator = new SentenceLengthValidator();
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

  describe("extractSentences", () => {
    it("should extract sentences from content", () => {
      const content = `# Test Document

This is a short sentence. This is another sentence. This is a very long sentence that exceeds the default maximum length and should be detected as problematic.

## Section 1

More content here.
`;

      const sentences = validator["extractSentences"](content);

      expect(sentences.length).toBeGreaterThan(0);
      expect(sentences[0].text).toBe("This is a short sentence");
      expect(sentences[0].line).toBe(3);
    });

    it("should skip markdown headers and lists", () => {
      const content = `# Header

- List item
- Another list item

## Subheader

Normal paragraph with sentences.
`;

      const sentences = validator["extractSentences"](content);

      // Should only extract sentences from the normal paragraph
      expect(sentences.length).toBe(1);
      expect(sentences[0].text).toBe("Normal paragraph with sentences");
    });

    it("should handle code blocks", () => {
      const content = `# Test

\`\`\`
This is code and should not be analyzed.
\`\`\`

Normal sentence here.
`;

      const sentences = validator["extractSentences"](content);

      expect(sentences.length).toBe(1);
      expect(sentences[0].text).toBe("Normal sentence here");
    });
  });

  describe("shouldSkipLine", () => {
    it("should skip markdown headers", () => {
      expect(validator["shouldSkipLine"]("# Header")).toBe(true);
      expect(validator["shouldSkipLine"]("## Subheader")).toBe(true);
      expect(validator["shouldSkipLine"]("### Sub-subheader")).toBe(true);
    });

    it("should skip list items", () => {
      expect(validator["shouldSkipLine"]("- List item")).toBe(true);
      expect(validator["shouldSkipLine"]("* Another item")).toBe(true);
      expect(validator["shouldSkipLine"]("+ Yet another")).toBe(true);
      expect(validator["shouldSkipLine"]("1. Numbered item")).toBe(true);
    });

    it("should skip code blocks", () => {
      expect(validator["shouldSkipLine"]("```")).toBe(true);
      expect(validator["shouldSkipLine"]("```javascript")).toBe(true);
    });

    it("should skip horizontal rules", () => {
      expect(validator["shouldSkipLine"]("---")).toBe(true);
      expect(validator["shouldSkipLine"]("***")).toBe(true);
      expect(validator["shouldSkipLine"]("___")).toBe(true);
    });

    it("should skip blockquotes", () => {
      expect(validator["shouldSkipLine"]("> Quote")).toBe(true);
    });

    it("should not skip normal text", () => {
      expect(validator["shouldSkipLine"]("This is normal text.")).toBe(false);
      expect(validator["shouldSkipLine"]("Another sentence here.")).toBe(false);
    });
  });

  describe("fixLongSentence", () => {
    it("should fix sentences that are too long", () => {
      const longSentence =
        "This is a very long sentence that exceeds the maximum length and should be broken down into smaller parts for better readability.";
      const fixed = validator["fixLongSentence"](longSentence, 50);

      // The fixed sentence might be longer due to added periods and spaces
      expect(fixed).toContain(".");
      expect(fixed).not.toBe(longSentence);
    });

    it("should not modify short sentences", () => {
      const shortSentence = "This is short.";
      const fixed = validator["fixLongSentence"](shortSentence, 100);

      expect(fixed).toBe(shortSentence);
    });
  });

  describe("validateContent", () => {
    it("should validate content with short sentences", async () => {
      const content = `# Test Document

This is a short sentence. This is another short sentence.

## Section 1

More content here.
`;

      const result = await validator.validateContent(content, { maxLength: 100 });
      expect(result.success).toBe(true);
    });

    it("should detect long sentences", async () => {
      const content = `# Test Document

This is a very long sentence that exceeds the maximum length and should be detected as problematic because it goes on and on without proper breaks.

## Section 1

More content here.
`;

      const result = await validator.validateContent(content, { maxLength: 50 });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Sentence too long");
    });

    it("should fix long sentences when fix option is enabled", async () => {
      const content = `# Test Document

This is a very long sentence that exceeds the maximum length and should be fixed automatically.

## Section 1

More content here.
`;

      const result = await validator.validateContent(content, { maxLength: 50, fix: true });
      expect(result.success).toBe(true);
      expect(result.fixes).toBeDefined();
      expect(result.fixes!.length).toBeGreaterThan(0);
    });
  });

  describe("validateFile", () => {
    it("should validate file with short sentences", async () => {
      const testFile = path.join(testDir, "test.md");
      const content = `# Test Document

This is a short sentence. This is another short sentence.

## Section 1

More content here.
`;

      fs.writeFileSync(testFile, content, "utf8");

      const result = await validator.validateFile(testFile, { maxLength: 100 });
      expect(result.success).toBe(true);
    });

    it("should handle non-existent file", async () => {
      const nonExistentFile = path.join(testDir, "non-existent.md");

      const result = await validator.validateFile(nonExistentFile);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to read file");
    });
  });

  describe("getSentenceStats", () => {
    it("should return correct sentence statistics", () => {
      const content = `# Test Document

This is a short sentence. This is a very long sentence that exceeds the default maximum length and should be counted as a long sentence.

## Section 1

Another sentence here.
`;

      const stats = validator.getSentenceStats(content);

      expect(stats.total).toBe(3);
      expect(stats.averageLength).toBeGreaterThan(0);
      expect(stats.maxLength).toBeGreaterThan(0);
      expect(stats.longSentences).toBeGreaterThan(0);
      expect(stats.longSentenceThreshold).toBe(100);
    });
  });

  describe("error handling", () => {
    it("should handle content validation errors", async () => {
      // Mock fs.readFileSync to throw an error
      const originalReadFileSync = fs.readFileSync;
      fs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error("File read error");
      });

      const result = await validator.validateFile("test.md", {
        maxLength: 100,
        fix: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to read file");

      // Restore original function
      fs.readFileSync = originalReadFileSync;
    });

    it("should fix long sentences with good break points", () => {
      const longSentence =
        "This is a very long sentence that has multiple clauses and should be broken at appropriate points like commas or conjunctions.";
      const fixed = validator.fixLongSentence(longSentence, 50);

      expect(fixed).toContain(".");
      expect(fixed).not.toBe(longSentence);
      expect(fixed.length).toBeGreaterThan(longSentence.length); // Should be longer due to added periods
    });

    it("should fix long sentences without good break points", () => {
      const longSentence = "Thisisaverylongsentencewithoutanyspacesorbreakpointsandshouldbebrokenatthemaxlength.";
      const fixed = validator.fixLongSentence(longSentence, 30);

      expect(fixed).toContain(".");
      expect(fixed).not.toBe(longSentence);
      expect(fixed.length).toBeGreaterThan(longSentence.length);
    });

    it("should handle empty content", async () => {
      const result = await validator.validateContent("", {
        maxLength: 100,
        fix: false,
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toBeUndefined();
      expect(result.fixes).toBeUndefined();
    });

    it("should handle content with only markdown headers", async () => {
      const content = `# Header 1
## Header 2
### Header 3`;

      const result = await validator.validateContent(content, {
        maxLength: 100,
        fix: false,
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toBeUndefined();
      expect(result.fixes).toBeUndefined();
    });
  });
});
