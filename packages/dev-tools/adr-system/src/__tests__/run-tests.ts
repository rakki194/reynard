#!/usr/bin/env node

/**
 * Test runner script for ADR System
 * 
 * This script provides a comprehensive test runner that can execute
 * all tests, generate coverage reports, and provide detailed output.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

interface TestOptions {
  coverage?: boolean;
  watch?: boolean;
  verbose?: boolean;
  ui?: boolean;
  reporter?: string;
}

class ADRTestRunner {
  private readonly projectRoot: string;
  private readonly testDir: string;
  private readonly coverageDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.testDir = join(this.projectRoot, "src", "__tests__");
    this.coverageDir = join(this.projectRoot, "coverage");
  }

  /**
   * Run all tests with specified options
   */
  async runTests(options: TestOptions = {}): Promise<void> {
    console.log("🦊 Starting ADR System test suite...");
    
    // Ensure coverage directory exists
    if (options.coverage && !existsSync(this.coverageDir)) {
      mkdirSync(this.coverageDir, { recursive: true });
    }

    const vitestArgs = this.buildVitestArgs(options);
    const command = `npx vitest ${vitestArgs.join(" ")}`;

    try {
      console.log(`Running: ${command}`);
      execSync(command, { 
        stdio: "inherit",
        cwd: this.projectRoot,
        env: { ...process.env, NODE_ENV: "test" }
      });
      
      console.log("✅ All tests completed successfully!");
      
      if (options.coverage) {
        this.displayCoverageSummary();
      }
      
    } catch (error) {
      console.error("❌ Tests failed:", error);
      process.exit(1);
    }
  }

  /**
   * Build Vitest command arguments
   */
  private buildVitestArgs(options: TestOptions): string[] {
    const args: string[] = [];

    if (options.watch) {
      args.push("--watch");
    }

    if (options.coverage) {
      args.push("--coverage");
    }

    if (options.ui) {
      args.push("--ui");
    }

    if (options.verbose) {
      args.push("--reporter=verbose");
    } else if (options.reporter) {
      args.push(`--reporter=${options.reporter}`);
    }

    // Add test directory
    args.push(this.testDir);

    return args;
  }

  /**
   * Display coverage summary
   */
  private displayCoverageSummary(): void {
    console.log("\n📊 Coverage Summary:");
    console.log("===================");
    
    try {
      const coverageReport = join(this.coverageDir, "coverage-summary.json");
      if (existsSync(coverageReport)) {
        const coverage = require(coverageReport);
        
        console.log(`Total Coverage: ${coverage.total.lines.pct}%`);
        console.log(`Statements: ${coverage.total.statements.pct}%`);
        console.log(`Branches: ${coverage.total.branches.pct}%`);
        console.log(`Functions: ${coverage.total.functions.pct}%`);
        console.log(`Lines: ${coverage.total.lines.pct}%`);
        
        console.log("\n📁 File Coverage:");
        Object.entries(coverage).forEach(([file, data]: [string, any]) => {
          if (file !== "total" && data.lines) {
            console.log(`${file}: ${data.lines.pct}%`);
          }
        });
      }
    } catch (error) {
      console.warn("Could not read coverage summary:", error);
    }
  }

  /**
   * Run specific test file
   */
  async runTestFile(testFile: string): Promise<void> {
    const filePath = join(this.testDir, testFile);
    
    if (!existsSync(filePath)) {
      console.error(`❌ Test file not found: ${filePath}`);
      process.exit(1);
    }

    console.log(`🦊 Running test file: ${testFile}`);
    
    try {
      execSync(`npx vitest run ${filePath}`, {
        stdio: "inherit",
        cwd: this.projectRoot,
        env: { ...process.env, NODE_ENV: "test" }
      });
      
      console.log("✅ Test file completed successfully!");
    } catch (error) {
      console.error("❌ Test file failed:", error);
      process.exit(1);
    }
  }

  /**
   * Run tests with coverage
   */
  async runWithCoverage(): Promise<void> {
    await this.runTests({ coverage: true, verbose: true });
  }

  /**
   * Run tests in watch mode
   */
  async runWatch(): Promise<void> {
    await this.runTests({ watch: true });
  }

  /**
   * Run tests with UI
   */
  async runWithUI(): Promise<void> {
    await this.runTests({ ui: true });
  }

  /**
   * Display help information
   */
  displayHelp(): void {
    console.log(`
🦊 ADR System Test Runner

Usage: npm run test [options]

Options:
  --coverage    Generate coverage report
  --watch       Run tests in watch mode
  --ui          Open Vitest UI
  --verbose     Verbose output
  --file <name> Run specific test file
  --help        Show this help

Examples:
  npm run test                    # Run all tests
  npm run test -- --coverage     # Run with coverage
  npm run test -- --watch        # Run in watch mode
  npm run test -- --ui           # Open UI
  npm run test -- --file CodebaseAnalyzer.test.ts

Test Files:
  - CodebaseAnalyzer.test.ts      # Codebase analysis tests
  - ADRGenerator.test.ts          # ADR generation tests
  - ADRValidator.test.ts          # ADR validation tests
  - ADRRelationshipMapper.test.ts # Relationship mapping tests
  - types.test.ts                 # Type definition tests
  - integration.test.ts           # Integration tests
`);
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const runner = new ADRTestRunner();

  if (args.includes("--help") || args.includes("-h")) {
    runner.displayHelp();
    return;
  }

  if (args.includes("--coverage")) {
    await runner.runWithCoverage();
  } else if (args.includes("--watch")) {
    await runner.runWatch();
  } else if (args.includes("--ui")) {
    await runner.runWithUI();
  } else {
    const fileIndex = args.indexOf("--file");
    if (fileIndex !== -1 && args[fileIndex + 1]) {
      await runner.runTestFile(args[fileIndex + 1]);
    } else {
      await runner.runTests({ verbose: args.includes("--verbose") });
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  });
}

export { ADRTestRunner };
