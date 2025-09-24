#!/usr/bin/env node

/**
 * 🦊 Reynard Incremental Linting CLI
 * ==================================
 *
 * Command-line interface for the incremental linting system.
 */

import { Command } from "commander";
import { IncrementalLintingService, createDefaultConfig, loadConfig, saveConfig } from "./index.js";
import { validateConfig } from "./config.js";
import type { IncrementalLintingConfig } from "./types.js";

const program = new Command();

program
  .name("reynard-incremental-linting")
  .description("🦊 Incremental linting system with queue management for Reynard monorepo")
  .version("0.1.0");

program
  .command("start")
  .description("Start the incremental linting service")
  .option("-c, --config <path>", "Configuration file path", ".reynard-linting.json")
  .option("-r, --root <path>", "Root directory to watch", process.cwd())
  .option("-v, --verbose", "Enable verbose logging", false)
  .option("--no-cache", "Disable caching", false)
  .option("--max-concurrency <number>", "Maximum concurrent linters", "4")
  .action(async (options: any) => {
    try {
      let config: IncrementalLintingConfig;
      
      try {
        config = await loadConfig(options.config);
      } catch {
        // Create default config if file doesn't exist
        config = createDefaultConfig(options.root);
        config.verbose = options.verbose;
        config.persistCache = !options.noCache;
        config.maxConcurrency = parseInt(options.maxConcurrency);
        
        // Save default config
        await saveConfig(config, options.config);
        console.log(`📝 Created default configuration at ${options.config}`);
      }

      // Override with CLI options
      config.rootPath = options.root;
      config.verbose = options.verbose;
      config.persistCache = !options.noCache;
      config.maxConcurrency = parseInt(options.maxConcurrency);

      // Validate configuration
      const validation = validateConfig(config);
      if (!validation.valid) {
        console.error("❌ Configuration errors:");
        validation.errors.forEach((error: string) => console.error(`  - ${error}`));
        process.exit(1);
      }

      // Start the service
      const service = new IncrementalLintingService(config);
      
      // Handle graceful shutdown
      process.on("SIGINT", async () => {
        console.log("\n🦊 Shutting down incremental linting service...");
        await service.stop();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        console.log("\n🦊 Shutting down incremental linting service...");
        await service.stop();
        process.exit(0);
      });

      await service.start();
      
      // Keep the process running
      console.log("🦊 Incremental linting service is running. Press Ctrl+C to stop.");
      
    } catch (error: any) {
      console.error("❌ Failed to start incremental linting service:", error);
      process.exit(1);
    }
  });

program
  .command("lint")
  .description("Lint specific files")
  .argument("<files...>", "Files to lint")
  .option("-c, --config <path>", "Configuration file path", ".reynard-linting.json")
  .option("-r, --root <path>", "Root directory", process.cwd())
  .option("-f, --format <format>", "Output format", "text")
  .action(async (files: string[], options: any) => {
    try {
      let config: IncrementalLintingConfig;
      
      try {
        config = await loadConfig(options.config);
      } catch {
        config = createDefaultConfig(options.root);
      }

      config.rootPath = options.root;
      config.outputFormat = options.format as "json" | "text" | "vscode";

      const service = new IncrementalLintingService(config);
      await service.start();

      const results = await service.lintFiles(files);
      
      // Output results
      if (options.format === "json") {
        console.log(JSON.stringify(results, null, 2));
      } else {
        for (const result of results) {
          if (result.issues.length > 0) {
            console.log(`\n📁 ${result.filePath}`);
            for (const issue of result.issues) {
              const severity = issue.severity.toUpperCase();
              const location = `${issue.line}:${issue.column}`;
              console.log(`  ${severity} [${location}] ${issue.message}`);
              if (issue.rule) {
                console.log(`    Rule: ${issue.rule}`);
              }
            }
          }
        }
      }

      await service.stop();
      
    } catch (error: any) {
      console.error("❌ Failed to lint files:", error);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Show linting service status")
  .option("-c, --config <path>", "Configuration file path", ".reynard-linting.json")
  .action(async (options: any) => {
    try {
      const config = await loadConfig(options.config);
      const service = new IncrementalLintingService(config);
      
      const status = service.getStatus();
      
      console.log("🦊 Incremental Linting Service Status");
      console.log("=====================================");
      console.log(`Root Path: ${config.rootPath}`);
      console.log(`Enabled Linters: ${config.linters.filter(l => l.enabled).length}`);
      console.log(`Max Concurrency: ${config.maxConcurrency}`);
      console.log(`Incremental Mode: ${config.incremental ? "Enabled" : "Disabled"}`);
      console.log(`Cache: ${config.persistCache ? "Enabled" : "Disabled"}`);
      console.log(`Total Issues: ${status.totalIssues}`);
      console.log(`Average Lint Time: ${status.averageLintTime.toFixed(2)}ms`);
      
      if (status.issuesBySeverity) {
        console.log("\nIssues by Severity:");
        Object.entries(status.issuesBySeverity).forEach(([severity, count]) => {
          if (count > 0) {
            console.log(`  ${severity}: ${count}`);
          }
        });
      }
      
    } catch (error: any) {
      console.error("❌ Failed to get status:", error);
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize configuration file")
  .option("-r, --root <path>", "Root directory", process.cwd())
  .option("-o, --output <path>", "Output configuration file", ".reynard-linting.json")
  .action(async (options: any) => {
    try {
      const config = createDefaultConfig(options.root);
      await saveConfig(config, options.output);
      console.log(`✅ Created configuration file at ${options.output}`);
      console.log("📝 Edit the configuration file to customize linters and settings");
      
    } catch (error: any) {
      console.error("❌ Failed to initialize configuration:", error);
      process.exit(1);
    }
  });

program
  .command("clear-cache")
  .description("Clear the linting cache")
  .option("-c, --config <path>", "Configuration file path", ".reynard-linting.json")
  .action(async (options: any) => {
    try {
      const config = await loadConfig(options.config);
      const service = new IncrementalLintingService(config);
      
      await service.clearCache();
      console.log("✅ Linting cache cleared");
      
    } catch (error: any) {
      console.error("❌ Failed to clear cache:", error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export program for testing
export { program };




