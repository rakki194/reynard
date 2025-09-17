#!/usr/bin/env node

/**
 * 🦊 Dev Server Management CLI
 *
 * Modern command-line interface for development server management.
 * Provides rich terminal output and interactive features.
 */

import { Command } from "commander";
import chalk from "chalk";

// Import command handlers
import { handleStart } from "./commands/start.js";
import { handleStop } from "./commands/stop.js";
import { handleRestart } from "./commands/restart.js";
import { handleStatus } from "./commands/status.js";
import { handleList } from "./commands/list.js";
import { handleStartMultiple } from "./commands/start-multiple.js";
import { handleStopAll } from "./commands/stop-all.js";
import { handleHealth } from "./commands/health.js";
import { handleConfig } from "./commands/config.js";
import { handleStats } from "./commands/stats.js";

import type { GlobalOptions } from "./commands/types.js";

const program = new Command();

program
  .name("dev-server")
  .description("🦊 Dev Server Management")
  .version("1.0.0")
  .option("-c, --config <path>", "Configuration file path", "dev-server.config.json")
  .option("-v, --verbose", "Verbose output")
  .option("--no-color", "Disable colored output");

program
  .command("start <project>")
  .description("Start a development server")
  .option("-p, --port <port>", "Override port number")
  .option("-d, --detached", "Run in detached mode")
  .option("--no-health-check", "Disable health checking")
  .action(async (project: string, options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleStart(project, options, globalOptions);
  });

program
  .command("stop <project>")
  .description("Stop a development server")
  .option("-f, --force", "Force stop (SIGKILL)")
  .action(async (project: string, options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleStop(project, options, globalOptions);
  });

program
  .command("restart <project>")
  .description("Restart a development server")
  .action(async (project: string) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleRestart(project, globalOptions);
  });

program
  .command("status [project]")
  .description("Show server status")
  .option("-j, --json", "Output as JSON")
  .option("--health", "Show health status")
  .action(async (project: string | undefined, options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleStatus(project, options, globalOptions);
  });

program
  .command("list")
  .description("List available projects")
  .option("-c, --category <category>", "Filter by category")
  .option("-j, --json", "Output as JSON")
  .action(async (options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleList(options, globalOptions);
  });

program
  .command("start-multiple")
  .description("Start multiple servers interactively")
  .action(async () => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleStartMultiple(globalOptions);
  });

program
  .command("stop-all")
  .description("Stop all running servers")
  .option("-f, --force", "Force stop all servers")
  .action(async (options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleStopAll(options, globalOptions);
  });

program
  .command("health [project]")
  .description("Show health status")
  .option("-j, --json", "Output as JSON")
  .option("-w, --watch", "Watch health status")
  .action(async (project: string | undefined, options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleHealth(project, options, globalOptions);
  });

program
  .command("config")
  .description("Configuration management")
  .option("--validate", "Validate configuration")
  .option("--migrate <path>", "Migrate from old configuration")
  .action(async (options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleConfig(options, globalOptions);
  });

program
  .command("stats")
  .description("Show system statistics")
  .option("-j, --json", "Output as JSON")
  .action(async (options: any) => {
    const globalOptions = program.opts<GlobalOptions>();
    await handleStats(options, globalOptions);
  });

program.on("command:*", () => {
  console.error(chalk.red("❌ Invalid command. Use --help for available commands."));
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
