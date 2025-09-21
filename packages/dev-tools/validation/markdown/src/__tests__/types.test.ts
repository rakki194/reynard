import { describe, it, expect } from "vitest";

// Import types to ensure they are properly exported
import type {
  ValidationResult,
  ToCAnalysis,
  ToCValidationOptions,
  LinkValidationOptions,
  SentenceLengthOptions,
  ValidationOptions,
  MarkdownFile,
} from "../types.js";

describe("Types", () => {
  it("should have ValidationResult type", () => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalFiles: 1,
        validFiles: 1,
        invalidFiles: 0,
      },
    };
    expect(result.isValid).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.stats.totalFiles).toBe(1);
  });

  it("should have ToCAnalysis type", () => {
    const analysis: ToCAnalysis = {
      hasToC: true,
      tocSections: 1,
      tocEntries: 3,
      conflicts: [],
      duplicates: [],
      missingAnchors: [],
    };
    expect(analysis.hasToC).toBe(true);
    expect(analysis.tocSections).toBe(1);
    expect(analysis.tocEntries).toBe(3);
    expect(Array.isArray(analysis.conflicts)).toBe(true);
    expect(Array.isArray(analysis.duplicates)).toBe(true);
    expect(Array.isArray(analysis.missingAnchors)).toBe(true);
  });

  it("should have ToCValidationOptions type", () => {
    const options: ToCValidationOptions = {
      fix: true,
      strict: false,
      maxDepth: 3,
    };
    expect(options.fix).toBe(true);
    expect(options.strict).toBe(false);
    expect(options.maxDepth).toBe(3);
  });

  it("should have LinkValidationOptions type", () => {
    const options: LinkValidationOptions = {
      checkExternal: true,
      checkInternal: true,
      checkAnchors: true,
      timeout: 5000,
    };
    expect(options.checkExternal).toBe(true);
    expect(options.checkInternal).toBe(true);
    expect(options.checkAnchors).toBe(true);
    expect(options.timeout).toBe(5000);
  });

  it("should have SentenceLengthOptions type", () => {
    const options: SentenceLengthOptions = {
      maxLength: 100,
      fix: true,
      ignoreCodeBlocks: true,
    };
    expect(options.maxLength).toBe(100);
    expect(options.fix).toBe(true);
    expect(options.ignoreCodeBlocks).toBe(true);
  });

  it("should have ValidationOptions type", () => {
    const options: ValidationOptions = {
      toc: {
        fix: true,
        strict: false,
        maxDepth: 3,
      },
      links: {
        checkExternal: true,
        checkInternal: true,
        checkAnchors: true,
        timeout: 5000,
      },
      sentenceLength: {
        maxLength: 100,
        fix: true,
        ignoreCodeBlocks: true,
      },
    };
    expect(options.toc?.fix).toBe(true);
    expect(options.links?.checkExternal).toBe(true);
    expect(options.sentenceLength?.maxLength).toBe(100);
  });

  it("should have MarkdownFile type", () => {
    const file: MarkdownFile = {
      path: "test.md",
      content: "# Test\n\nContent here.",
      lines: ["# Test", "", "Content here."],
    };
    expect(file.path).toBe("test.md");
    expect(file.content).toBe("# Test\n\nContent here.");
    expect(Array.isArray(file.lines)).toBe(true);
    expect(file.lines.length).toBe(3);
  });
});
