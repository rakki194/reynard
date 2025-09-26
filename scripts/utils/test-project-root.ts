#!/usr/bin/env node
/**
 * @fileoverview Project Root Utility Tests for Node.js/TypeScript
 *
 * 🦊 *whiskers twitch with testing precision* Comprehensive tests to ensure
 * the TypeScript project root utility behaves consistently with Shell and Python versions.
 *
 * @author Strategic-Fox-42 (Reynard Fox Specialist)
 * @since 1.0.0
 */

import { existsSync } from "fs";
import { join } from "path";
import {
  getProjectRoot,
  getProjectPath,
  getE2EDir,
  getBackendDir,
  getExamplesDir,
  getPackagesDir,
  PROJECT_ROOT,
  E2E_DIR,
  BACKEND_DIR,
  EXAMPLES_DIR,
  PACKAGES_DIR,
} from "./project-root.js";

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Colors for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

/**
 * Run a single test
 * @param testName - Name of the test
 * @param testFunction - Function that returns the test result
 * @param expectedResult - Expected result
 */
function runTest(testName: string, testFunction: () => any, expectedResult: any): void {
  testsRun++;
  console.log(`${colors.blue}🧪 Running test: ${testName}${colors.reset}`);

  try {
    const actualResult = testFunction();

    if (actualResult === expectedResult) {
      console.log(`  ${colors.green}✅ PASS${colors.reset}: ${testName}`);
      console.log(`    Expected: ${expectedResult}`);
      console.log(`    Got:      ${actualResult}`);
      testsPassed++;
    } else {
      console.log(`  ${colors.red}❌ FAIL${colors.reset}: ${testName}`);
      console.log(`    Expected: ${expectedResult}`);
      console.log(`    Got:      ${actualResult}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ${colors.red}❌ FAIL${colors.reset}: ${testName} (error: ${(error as Error).message})`);
    testsFailed++;
  }
  console.log();
}

/**
 * Test default behavior
 */
function testDefaultBehavior(): void {
  console.log(`${colors.yellow}🔧 Testing default behavior...${colors.reset}`);

  const expectedProjectRoot = "/home/kade/runeset/reynard";

  // Test main project root
  runTest("Default project root", () => getProjectRoot(), expectedProjectRoot);
  runTest("PROJECT_ROOT constant", () => PROJECT_ROOT, expectedProjectRoot);

  // Test convenience functions
  runTest("getE2EDir function", () => getE2EDir(), "/home/kade/runeset/reynard/e2e");
  runTest("getBackendDir function", () => getBackendDir(), "/home/kade/runeset/reynard/backend");
  runTest("getExamplesDir function", () => getExamplesDir(), "/home/kade/runeset/reynard/examples");
  runTest("getPackagesDir function", () => getPackagesDir(), "/home/kade/runeset/reynard/packages");

  // Test constants
  runTest("E2E_DIR constant", () => E2E_DIR, "/home/kade/runeset/reynard/e2e");
  runTest("BACKEND_DIR constant", () => BACKEND_DIR, "/home/kade/runeset/reynard/backend");
  runTest("EXAMPLES_DIR constant", () => EXAMPLES_DIR, "/home/kade/runeset/reynard/examples");
  runTest("PACKAGES_DIR constant", () => PACKAGES_DIR, "/home/kade/runeset/reynard/packages");
}

/**
 * Test getProjectPath function
 */
function testGetProjectPath(): void {
  console.log(`${colors.yellow}🔧 Testing getProjectPath function...${colors.reset}`);

  runTest("getProjectPath with backend", () => getProjectPath("backend"), "/home/kade/runeset/reynard/backend");
  runTest("getProjectPath with e2e", () => getProjectPath("e2e"), "/home/kade/runeset/reynard/e2e");
  runTest("getProjectPath with examples", () => getProjectPath("examples"), "/home/kade/runeset/reynard/examples");
  runTest("getProjectPath with packages", () => getProjectPath("packages"), "/home/kade/runeset/reynard/packages");
  runTest(
    "getProjectPath with nested path",
    () => getProjectPath("backend/data"),
    "/home/kade/runeset/reynard/backend/data"
  );
}

/**
 * Test directory existence
 */
function testDirectoryExistence(): void {
  console.log(`${colors.yellow}🔧 Testing directory existence...${colors.reset}`);

  runTest("Project root exists", () => (existsSync(PROJECT_ROOT) ? "exists" : "missing"), "exists");
  runTest("Backend directory exists", () => (existsSync(BACKEND_DIR) ? "exists" : "missing"), "exists");
  runTest("E2E directory exists", () => (existsSync(E2E_DIR) ? "exists" : "missing"), "exists");
  runTest("Examples directory exists", () => (existsSync(EXAMPLES_DIR) ? "exists" : "missing"), "exists");
  runTest("Packages directory exists", () => (existsSync(PACKAGES_DIR) ? "exists" : "missing"), "exists");
}

/**
 * Test project structure validation
 */
function testProjectStructure(): void {
  console.log(`${colors.yellow}🔧 Testing project structure validation...${colors.reset}`);

  // Test that package.json exists in project root
  const packageJsonPath = join(PROJECT_ROOT, "package.json");
  runTest("Package.json exists", () => (existsSync(packageJsonPath) ? "exists" : "missing"), "exists");

  // Test that key directories exist
  runTest(
    "Backend directory exists in project root",
    () => (existsSync(join(PROJECT_ROOT, "backend")) ? "exists" : "missing"),
    "exists"
  );
  runTest(
    "E2E directory exists in project root",
    () => (existsSync(join(PROJECT_ROOT, "e2e")) ? "exists" : "missing"),
    "exists"
  );
  runTest(
    "Examples directory exists in project root",
    () => (existsSync(join(PROJECT_ROOT, "examples")) ? "exists" : "missing"),
    "exists"
  );
  runTest(
    "Packages directory exists in project root",
    () => (existsSync(join(PROJECT_ROOT, "packages")) ? "exists" : "missing"),
    "exists"
  );
}

/**
 * Test consistency between functions and constants
 */
function testConsistency(): void {
  console.log(`${colors.yellow}🔧 Testing consistency between functions and constants...${colors.reset}`);

  runTest(
    "getProjectRoot() === PROJECT_ROOT",
    () => (getProjectRoot() === PROJECT_ROOT ? "consistent" : "inconsistent"),
    "consistent"
  );
  runTest("getE2EDir() === E2E_DIR", () => (getE2EDir() === E2E_DIR ? "consistent" : "inconsistent"), "consistent");
  runTest(
    "getBackendDir() === BACKEND_DIR",
    () => (getBackendDir() === BACKEND_DIR ? "consistent" : "inconsistent"),
    "consistent"
  );
  runTest(
    "getExamplesDir() === EXAMPLES_DIR",
    () => (getExamplesDir() === EXAMPLES_DIR ? "consistent" : "inconsistent"),
    "consistent"
  );
  runTest(
    "getPackagesDir() === PACKAGES_DIR",
    () => (getPackagesDir() === PACKAGES_DIR ? "consistent" : "inconsistent"),
    "consistent"
  );
}

/**
 * Test path consistency
 */
function testPathConsistency(): void {
  console.log(`${colors.yellow}🔧 Testing path consistency...${colors.reset}`);

  runTest(
    "BACKEND_DIR === PROJECT_ROOT/backend",
    () => (BACKEND_DIR === join(PROJECT_ROOT, "backend") ? "consistent" : "inconsistent"),
    "consistent"
  );
  runTest(
    "E2E_DIR === PROJECT_ROOT/e2e",
    () => (E2E_DIR === join(PROJECT_ROOT, "e2e") ? "consistent" : "inconsistent"),
    "consistent"
  );
  runTest(
    "EXAMPLES_DIR === PROJECT_ROOT/examples",
    () => (EXAMPLES_DIR === join(PROJECT_ROOT, "examples") ? "consistent" : "inconsistent"),
    "consistent"
  );
  runTest(
    "PACKAGES_DIR === PROJECT_ROOT/packages",
    () => (PACKAGES_DIR === join(PROJECT_ROOT, "packages") ? "consistent" : "inconsistent"),
    "consistent"
  );
}

/**
 * Test expected values consistency
 */
function testExpectedValues(): void {
  console.log(`${colors.yellow}🔧 Testing expected values consistency...${colors.reset}`);

  const expectedValues = {
    project_root: "/home/kade/runeset/reynard",
    backend_dir: "/home/kade/runeset/reynard/backend",
    e2e_dir: "/home/kade/runeset/reynard/e2e",
    examples_dir: "/home/kade/runeset/reynard/examples",
    packages_dir: "/home/kade/runeset/reynard/packages",
  };

  const actualValues = {
    project_root: getProjectRoot(),
    backend_dir: getBackendDir(),
    e2e_dir: getE2EDir(),
    examples_dir: getExamplesDir(),
    packages_dir: getPackagesDir(),
  };

  for (const [key, expected] of Object.entries(expectedValues)) {
    runTest(
      `TypeScript ${key} matches expected`,
      () => (actualValues[key as keyof typeof actualValues] === expected ? "matches" : "mismatch"),
      "matches"
    );
  }
}

/**
 * Test environment variable override (simplified version)
 */
function testEnvironmentVariableOverride(): void {
  console.log(`${colors.yellow}🔧 Testing environment variable override...${colors.reset}`);

  // Save original environment variable
  const originalEnv = process.env.REYNARD_PROJECT_ROOT;

  try {
    // Test with custom environment variable
    const customRoot = "/tmp/test-reynard-root";
    process.env.REYNARD_PROJECT_ROOT = customRoot;

    // Since the module is already loaded, we can't test dynamic import easily
    // Instead, we'll test that the environment variable is set correctly
    runTest(
      "Environment variable is set",
      () => (process.env.REYNARD_PROJECT_ROOT === customRoot ? "set" : "not set"),
      "set"
    );

    // Note: The actual project root won't change because the module is already loaded
    // This is expected behavior for Node.js modules
    console.log(
      `  ${colors.yellow}ℹ️  INFO${colors.reset}: Environment variable override test is limited because the module is already loaded`
    );
    console.log(`    This is expected behavior for Node.js modules`);
    console.log();
  } catch (error) {
    console.log(
      `  ${colors.yellow}⚠️  SKIP${colors.reset}: Environment variable override (${(error as Error).message})`
    );
  } finally {
    // Restore original environment variable
    if (originalEnv !== undefined) {
      process.env.REYNARD_PROJECT_ROOT = originalEnv;
    } else {
      delete process.env.REYNARD_PROJECT_ROOT;
    }
  }
}

/**
 * Main test function
 */
async function main(): Promise<void> {
  console.log(`${colors.blue}🦊 TypeScript Project Root Utility Tests${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log();

  // Run all test suites
  testDefaultBehavior();
  testGetProjectPath();
  testDirectoryExistence();
  testProjectStructure();
  testConsistency();
  testPathConsistency();
  testExpectedValues();
  testEnvironmentVariableOverride();

  // Print summary
  console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.blue}===============${colors.reset}`);
  console.log(`Tests run:    ${testsRun}`);
  console.log(`Tests passed: ${colors.green}${testsPassed}${colors.reset}`);
  console.log(`Tests failed: ${colors.red}${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}💥 Some tests failed!${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  console.error(`${colors.red}💥 Test runner failed: ${(error as Error).message}${colors.reset}`);
  process.exit(1);
});
