/**
 * 🦦 Tests for ToC Validator - Conflict Detection
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { ToCValidator } from "../toc-validator.js";

// Test helper functions
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

function createDuplicateToCContent(): string {
  return `# Test Document

## Table of Contents

- [Section 1](#section-1)
- [Section 1](#section-1)
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

describe("ToCValidator - Conflict Detection", () => {
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

  it("should detect multiple ToC sections as conflict", () => {
    const content = createMultipleToCContent();
    const analysis = validator.analyzeToC(content);

    expect(analysis.tocCount).toBe(2);
    expect(analysis.hasConflict).toBe(true);
    expect(analysis.conflictDetails).toContain("2 ToC sections found");
  });

  it("should detect duplicate ToC entries as conflict", () => {
    const content = createDuplicateToCContent();
    const analysis = validator.analyzeToC(content);

    expect(analysis.hasDuplicates).toBe(true);
    expect(analysis.hasConflict).toBe(true);
    expect(analysis.duplicates).toContain("- [Section 1](#section-1)");
    expect(analysis.conflictDetails).toContain("duplicate ToC entries found");
  });
});
