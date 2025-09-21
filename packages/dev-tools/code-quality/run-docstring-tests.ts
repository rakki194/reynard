#!/usr/bin/env tsx
/**
 * Test runner for docstring validation system
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

const TEST_FILES = [
  "src/__tests__/DocstringAnalyzer.test.ts",
  "src/__tests__/IssueDetector.test.ts", 
  "src/__tests__/MetricsCalculator.test.ts",
  "src/__tests__/docstring-gates.test.ts",
  "src/__tests__/docstring-command.test.ts",
  "src/__tests__/CodeQualityAnalyzer.test.ts",
];

function runTests() {
  console.log("🦦 Running Docstring Validation System Tests");
  console.log("=" .repeat(50));

  // Check if test files exist
  const missingFiles = TEST_FILES.filter(file => !existsSync(file));
  if (missingFiles.length > 0) {
    console.error("❌ Missing test files:");
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }

  try {
    // Run tests with vitest
    const testCommand = `npx vitest run ${TEST_FILES.join(" ")} --reporter=verbose`;
    console.log(`📋 Running: ${testCommand}`);
    
    execSync(testCommand, { 
      stdio: "inherit",
      cwd: process.cwd()
    });

    console.log("\n✅ All docstring validation tests passed!");
    
  } catch (error) {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
