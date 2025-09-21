/**
 * Test setup for docstring validation system
 */

import { beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";

const TEST_TEMP_DIR = join(process.cwd(), "temp-test-files");

beforeAll(() => {
  // Create temporary directory for test files
  if (!existsSync(TEST_TEMP_DIR)) {
    mkdirSync(TEST_TEMP_DIR, { recursive: true });
  }
});

afterAll(() => {
  // Clean up temporary directory
  if (existsSync(TEST_TEMP_DIR)) {
    rmSync(TEST_TEMP_DIR, { recursive: true, force: true });
  }
});

// Export test utilities
export { TEST_TEMP_DIR };

export function createTestFile(filename: string, content: string): string {
  const filePath = join(TEST_TEMP_DIR, filename);
  const fs = require("fs");
  fs.writeFileSync(filePath, content);
  return filePath;
}

export function cleanupTestFile(filePath: string): void {
  const fs = require("fs");
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function createTestPythonFile(filename: string, content: string): string {
  return createTestFile(`${filename}.py`, content);
}

export function createTestTypeScriptFile(filename: string, content: string): string {
  return createTestFile(`${filename}.ts`, content);
}
