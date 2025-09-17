#!/usr/bin/env node
/**
 * ESLint Command - Run ESLint with i18n rules on all packages
 */
import { Command } from "commander";
import { getEnabledPackagePaths } from "../../config/i18n-testing-config";
export const createESLintCommand = () => {
    const command = new Command("eslint");
    command
        .description("Run ESLint with i18n rules on all packages")
        .option("-f, --fix", "Fix auto-fixable issues")
        .option("--format <format>", "Output format (default: stylish)", "stylish")
        .action(async (options) => {
        try {
            console.log("🦊 Running ESLint with i18n rules...\n");
            const { execSync } = await import("child_process");
            const packagePaths = getEnabledPackagePaths();
            const command = [
                "npx eslint",
                packagePaths
                    .map((path) => `${path}/src/**/*.{ts,tsx,js,jsx}`)
                    .join(" "),
                "--config packages/testing/src/eslint/i18n-eslint-config.js",
                `--format ${options.format}`,
                options.fix ? "--fix" : "",
            ]
                .filter(Boolean)
                .join(" ");
            console.log(`Running: ${command}\n`);
            try {
                execSync(command, {
                    encoding: "utf8",
                    stdio: "inherit",
                    cwd: "../../",
                });
                console.log("\n✅ ESLint completed successfully!");
            }
            catch (error) {
                // ESLint exits with code 1 when issues are found, which is expected
                console.log("\n⚠️  ESLint found issues (see output above)");
                process.exit(1);
            }
        }
        catch (error) {
            console.error("💥 Error running ESLint:", error);
            process.exit(1);
        }
    });
    return command;
};
