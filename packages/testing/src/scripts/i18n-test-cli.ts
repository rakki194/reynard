#!/usr/bin/env node
/**
 * i18n Testing CLI
 * Command-line interface for running i18n tests across all Reynard packages
 */

import { program } from "commander";
import {
  runAllPackageI18nTests,
  createPackageI18nTestFiles,
  validatePackageI18nSetup,
} from "../utils/i18n-package-orchestrator";
import {
  getEnabledPackages,
  getEnabledPackagePaths,
} from "../config/i18n-testing-config";
import { writeFileSync } from "fs";
import { join } from "path";

program
  .name("i18n-test")
  .description("Run i18n tests across all Reynard packages")
  .version("1.0.0");

program
  .command("run")
  .description("Run i18n tests for all enabled packages")
  .option(
    "-p, --packages <packages...>",
    "Specific packages to test (default: all enabled)",
  )
  .option("-o, --output <file>", "Output file for test results (JSON format)")
  .option(
    "-r, --report <file>",
    "Output file for test report (Markdown format)",
  )
  .option("--fail-fast", "Stop on first failure")
  .option("--verbose", "Verbose output")
  .action(async (options: any) => {
    try {
      console.log("🦊 Reynard i18n Testing CLI\n");

      if (options.verbose) {
        console.log("📋 Configuration:");
        console.log(
          `   Packages: ${options.packages ? options.packages.join(", ") : "all enabled"}`,
        );
        console.log(`   Output: ${options.output || "console"}`);
        console.log(`   Report: ${options.report || "console"}`);
        console.log(`   Fail Fast: ${options.failFast ? "yes" : "no"}`);
        console.log("");
      }

      const result = await runAllPackageI18nTests();

      // Output JSON results if requested
      if (options.output) {
        const jsonOutput = {
          timestamp: new Date().toISOString(),
          success: result.overallSuccess,
          summary: result.summary,
          duration: result.duration,
          packages: result.packageResults.map((pkg) => ({
            name: pkg.packageName,
            path: pkg.packagePath,
            success: pkg.success,
            errors: pkg.errors,
            warnings: pkg.warnings,
            hardcodedStrings: pkg.results.hardcodedStrings.length,
            missingTranslations: pkg.results.translationValidation.reduce(
              (sum, v) => sum + v.missingKeys.length,
              0,
            ),
            rtlIssues: pkg.results.rtlIssues.length,
          })),
        };

        writeFileSync(options.output, JSON.stringify(jsonOutput, null, 2));
        console.log(`📄 Results written to: ${options.output}`);
      }

      // Output Markdown report if requested
      if (options.report) {
        writeFileSync(options.report, result.report);
        console.log(`📊 Report written to: ${options.report}`);
      }

      // Exit with appropriate code
      process.exit(result.overallSuccess ? 0 : 1);
    } catch (error) {
      console.error("💥 Error running i18n tests:", error);
      process.exit(1);
    }
  });

program
  .command("setup")
  .description("Set up i18n test files for all packages")
  .option("--force", "Overwrite existing test files")
  .action(async (options: any) => {
    try {
      console.log("🦊 Setting up i18n test files...\n");

      await createPackageI18nTestFiles();

      console.log("✅ i18n test files setup complete!");
    } catch (error) {
      console.error("💥 Error setting up i18n test files:", error);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate i18n setup for all packages")
  .action(async () => {
    try {
      console.log("🦊 Validating i18n setup...\n");

      const validation = await validatePackageI18nSetup();

      if (validation.valid) {
        console.log("✅ All packages have proper i18n setup!");
      } else {
        console.log("❌ i18n setup issues found:");
        validation.issues.forEach((issue) => {
          console.log(`   - ${issue}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.error("💥 Error validating i18n setup:", error);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all packages and their i18n configuration")
  .option("--enabled-only", "Show only enabled packages")
  .action((options) => {
    console.log("🦊 Reynard Package i18n Configuration\n");

    const packages = options.enabledOnly
      ? getEnabledPackages()
      : getEnabledPackages();

    packages.forEach((pkg) => {
      const status = pkg.enabled ? "✅" : "❌";
      console.log(`${status} ${pkg.name}`);
      console.log(`   Path: ${pkg.path}`);
      console.log(`   Enabled: ${pkg.enabled}`);
      if (pkg.enabled) {
        console.log(`   Namespaces: ${pkg.namespaces.join(", ")}`);
        console.log(
          `   Fail on hardcoded strings: ${pkg.failOnHardcodedStrings}`,
        );
        console.log(`   Validate completeness: ${pkg.validateCompleteness}`);
        console.log(`   Test RTL: ${pkg.testRTL}`);
      }
      console.log("");
    });

    console.log(`Total packages: ${packages.length}`);
    console.log(
      `Enabled packages: ${packages.filter((p) => p.enabled).length}`,
    );
  });

program
  .command("eslint")
  .description("Run ESLint with i18n rules on all packages")
  .option("-f, --fix", "Fix auto-fixable issues")
  .option("--format <format>", "Output format (default: stylish)", "stylish")
  .action(async (options: any) => {
    try {
      console.log("🦊 Running ESLint with i18n rules...\n");

      const { execSync } = await import("child_process");
      const packagePaths = getEnabledPackagePaths();

      const command = [
        "npx eslint",
        packagePaths.join(" "),
        "--ext .ts,.tsx,.js,.jsx",
        "--config packages/testing/src/eslint/i18n-eslint-config.js",
        `--format ${options.format}`,
        options.fix ? "--fix" : "",
      ]
        .filter(Boolean)
        .join(" ");

      console.log(`Running: ${command}\n`);

      try {
        const output = execSync(command, {
          encoding: "utf8",
          stdio: "inherit",
        });
        console.log("\n✅ ESLint completed successfully!");
      } catch (error) {
        // ESLint exits with code 1 when issues are found, which is expected
        console.log("\n⚠️  ESLint found issues (see output above)");
        process.exit(1);
      }
    } catch (error) {
      console.error("💥 Error running ESLint:", error);
      process.exit(1);
    }
  });

program
  .command("ci")
  .description("Run i18n checks suitable for CI/CD")
  .option("--fail-on-hardcoded", "Fail on hardcoded strings", true)
  .option("--fail-on-missing", "Fail on missing translations", true)
  .option("--fail-on-rtl", "Fail on RTL issues", false)
  .option(
    "--coverage-threshold <threshold>",
    "Coverage threshold percentage",
    "80",
  )
  .action(async (options: any) => {
    try {
      console.log("🦊 Running i18n CI checks...\n");

      const result = await runAllPackageI18nTests();

      let failed = false;

      // Check hardcoded strings
      if (options.failOnHardcoded && result.summary.totalHardcodedStrings > 0) {
        console.log(
          `❌ Found ${result.summary.totalHardcodedStrings} hardcoded strings`,
        );
        failed = true;
      }

      // Check missing translations
      if (
        options.failOnMissing &&
        result.summary.totalMissingTranslations > 0
      ) {
        console.log(
          `❌ Found ${result.summary.totalMissingTranslations} missing translations`,
        );
        failed = true;
      }

      // Check RTL issues
      if (options.failOnRtl && result.summary.totalRTLIssues > 0) {
        console.log(`❌ Found ${result.summary.totalRTLIssues} RTL issues`);
        failed = true;
      }

      // Check coverage
      const coverageThreshold = parseInt(options.coverageThreshold);
      if (result.summary.averageCoverage < coverageThreshold) {
        console.log(
          `❌ Coverage ${result.summary.averageCoverage.toFixed(1)}% is below threshold ${coverageThreshold}%`,
        );
        failed = true;
      }

      if (failed) {
        console.log("\n❌ CI checks failed!");
        process.exit(1);
      } else {
        console.log("\n✅ All CI checks passed!");
        process.exit(0);
      }
    } catch (error) {
      console.error("💥 Error running CI checks:", error);
      process.exit(1);
    }
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

// Parse command line arguments
program.parse();
