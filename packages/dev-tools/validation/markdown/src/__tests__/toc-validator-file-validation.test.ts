/**
 * 🦦 Tests for ToC Validator - File Validation
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { ToCValidator } from "../toc-validator.js";

// Test helper functions
function createValidToCContent(): string {
  return `# Test Document

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content here.
`;
}

function createMultipleToCContent(): string {
  return `# Test Document

## Table of Contents

- [Section 1](#section-1)

## Table of Contents

- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content here.
`;
}

// Test setup helper
function setupTestEnvironment() {
  const validator = new ToCValidator();
  const testDir = path.join(process.cwd(), `.test-temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  return { validator, testDir };
}

function cleanupTestEnvironment(testDir: string) {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

describe("ToCValidator - File Validation Success", () => {
  let validator: ToCValidator;
  let testDir: string;

  beforeEach(() => {
    const setup = setupTestEnvironment();
    validator = setup.validator;
    testDir = setup.testDir;
  });

  afterEach(() => {
    cleanupTestEnvironment(testDir);
  });

  it("should validate file without conflicts", async () => {
    const testFile = path.join(testDir, "valid.md");
    const content = createValidToCContent();

    fs.writeFileSync(testFile, content, "utf8");

    const result = await validator.validateFile(testFile);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should fix conflicts when fix option is enabled", async () => {
    const testFile = path.join(testDir, "fixable.md");
    const content = createMultipleToCContent();

    fs.writeFileSync(testFile, content, "utf8");

    const result = await validator.validateFile(testFile, { fix: true });

    expect(result.success).toBe(true);
    expect(result.fixes).toBeDefined();
    expect(result.fixes?.length).toBeGreaterThan(0);

    // Check that file was actually fixed
    const fixedContent = fs.readFileSync(testFile, "utf8");
    const analysis = validator.analyzeToC(fixedContent);
    expect(analysis.tocCount).toBe(1);
  });
});

describe("ToCValidator - File Validation Errors", () => {
  let validator: ToCValidator;
  let testDir: string;

  beforeEach(() => {
    const setup = setupTestEnvironment();
    validator = setup.validator;
    testDir = setup.testDir;
  });

  afterEach(() => {
    cleanupTestEnvironment(testDir);
  });

  it("should detect conflicts in file", async () => {
    const testFile = path.join(testDir, "conflict.md");
    const content = createMultipleToCContent();

    fs.writeFileSync(testFile, content, "utf8");

    const result = await validator.validateFile(testFile);

    expect(result.success).toBe(false);
    expect(result.error).toContain("ToC conflict detected");
  });

  it("should handle non-existent file", async () => {
    const nonExistentFile = path.join(testDir, "non-existent.md");

    const result = await validator.validateFile(nonExistentFile);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to validate file");
  });

  it("should handle file validation errors", async () => {
    // Mock fs.readFileSync to throw an error
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = vi.fn().mockImplementation(() => {
      throw new Error("File read error");
    });

    const result = await validator.validateFile("test.md");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to validate file");

    // Restore original function
    fs.readFileSync = originalReadFileSync;
  });

  it("should run conflict test with verbose output", async () => {
    const testFilePath = path.join(testDir, "test-toc-conflict.md");
    const content = `# Test Document

## Table of Contents

- [Section 1](#section-1)

## Table of Contents

- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content.`;

    fs.writeFileSync(testFilePath, content);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await validator.runConflictTest(testFilePath, { verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🦊 Creating test markdown file"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🦊 Testing ToC conflict detection"));

    consoleSpy.mockRestore();
  });

  it("should run conflict test without conflicts", async () => {
    const testFilePath = path.join(testDir, "test-toc-no-conflict.md");
    const content = `# Test Document

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content.`;

    fs.writeFileSync(testFilePath, content);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await validator.runConflictTest(testFilePath, { verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🦊 Creating test markdown file"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🦊 Testing ToC conflict detection"));

    consoleSpy.mockRestore();
  });
});
