/**
 * 🦦 Tests for ToC Validator - Basic Detection
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

function createCaseInsensitiveToCContent(): string {
  return `# Test Document

## table of contents

- [Section 1](#section-1)

## Section 1

Content here.
`;
}

function createCustomToCContent(): string {
  return `# Test Document

## Contents

- [Section 1](#section-1)

## Section 1

Content here.
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

describe("ToCValidator - Basic Detection", () => {
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

  it("should detect single ToC section", () => {
    const content = createValidToCContent();
    const analysis = validator.analyzeToC(content);

    expect(analysis.tocCount).toBe(1);
    expect(analysis.entryCount).toBe(2);
    expect(analysis.hasDuplicates).toBe(false);
    expect(analysis.hasConflict).toBe(false);
    expect(analysis.entries).toEqual(["- [Section 1](#section-1)", "- [Section 2](#section-2)"]);
  });

  it("should handle case-insensitive ToC headers", () => {
    const content = createCaseInsensitiveToCContent();
    const analysis = validator.analyzeToC(content);

    expect(analysis.tocCount).toBe(1);
    expect(analysis.hasConflict).toBe(false);
  });

  it("should handle custom ToC header pattern", () => {
    const content = createCustomToCContent();
    const customPattern = /^##\s+Contents?$/i;
    const analysis = validator.analyzeToC(content, { tocHeaderPattern: customPattern });

    expect(analysis.tocCount).toBe(1);
    expect(analysis.hasConflict).toBe(false);
  });

  it("should handle empty content", () => {
    const result = validator.analyzeToC("");

    expect(result.tocCount).toBe(0);
    expect(result.entryCount).toBe(0);
    expect(result.hasConflict).toBe(false);
    expect(result.entries).toEqual([]);
  });

  it("should handle content with only headers", () => {
    const content = `# Header 1
## Header 2
### Header 3`;

    const result = validator.analyzeToC(content);

    expect(result.tocCount).toBe(0);
    expect(result.entryCount).toBe(0);
    expect(result.hasConflict).toBe(false);
    expect(result.entries).toEqual([]);
  });
});
