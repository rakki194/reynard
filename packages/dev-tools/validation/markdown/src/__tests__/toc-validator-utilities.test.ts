/**
 * 🦦 Tests for ToC Validator - Test Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { ToCValidator } from "../toc-validator.js";

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

describe("ToCValidator - Test Utilities", () => {
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

  it("should create test file with expected content", () => {
    const testFile = path.join(testDir, "test.md");

    validator.createTestFile(testFile);

    expect(fs.existsSync(testFile)).toBe(true);

    const content = fs.readFileSync(testFile, "utf8");
    expect(content).toContain("# Test ToC Conflict");
    expect(content).toContain("## Section 1");
    expect(content).toContain("## Section 2");
    expect(content).toContain("## Section 3");
  });

  it("should run conflict test and clean up", async () => {
    const testFile = path.join(testDir, "conflict-test.md");

    // Mock console.log to capture output
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await validator.runConflictTest(testFile);

    // Check that test file was created and then cleaned up
    expect(fs.existsSync(testFile)).toBe(false);

    // Check that some output was generated
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
