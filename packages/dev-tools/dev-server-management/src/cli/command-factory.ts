/**
 * Command Factory
 * Creates Commander.js command objects for testing and programmatic use
 */

import { Command } from "commander";
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

/**
 * Create start command
 */
export function createStartCommand(): Command {
  const command = new Command("start");
  command
    .description("Start a development server")
    .argument("<project>", "Project name")
    .option("-p, --port <port>", "Override port number")
    .option("-d, --detached", "Run in detached mode")
    .option("--no-health-check", "Disable health checking")
    .action(async (project: string, options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleStart(project, options, globalOptions);
    });
  return command;
}

/**
 * Create stop command
 */
export function createStopCommand(): Command {
  const command = new Command("stop");
  command
    .description("Stop a development server")
    .argument("<project>", "Project name")
    .option("-f, --force", "Force stop (SIGKILL)")
    .action(async (project: string, options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleStop(project, options, globalOptions);
    });
  return command;
}

/**
 * Create restart command
 */
export function createRestartCommand(): Command {
  const command = new Command("restart");
  command
    .description("Restart a development server")
    .argument("<project>", "Project name")
    .action(async (project: string) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleRestart(project, globalOptions);
    });
  return command;
}

/**
 * Create status command
 */
export function createStatusCommand(): Command {
  const command = new Command("status");
  command
    .description("Show server status")
    .argument("[project]", "Project name (optional)")
    .option("-j, --json", "Output as JSON")
    .option("--health", "Show health status")
    .action(async (project: string | undefined, options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleStatus(project, options, globalOptions);
    });
  return command;
}

/**
 * Create list command
 */
export function createListCommand(): Command {
  const command = new Command("list");
  command
    .description("List available projects")
    .option("-c, --category <category>", "Filter by category")
    .option("-j, --json", "Output as JSON")
    .action(async (options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleList(options, globalOptions);
    });
  return command;
}

/**
 * Create health command
 */
export function createHealthCommand(): Command {
  const command = new Command("health");
  command
    .description("Show health status")
    .argument("[project]", "Project name (optional)")
    .option("-j, --json", "Output as JSON")
    .option("-w, --watch", "Watch health status")
    .action(async (project: string | undefined, options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleHealth(project, options, globalOptions);
    });
  return command;
}

/**
 * Create config command
 */
export function createConfigCommand(): Command {
  const command = new Command("config");
  command
    .description("Configuration management")
    .option("--validate", "Validate configuration")
    .option("--migrate <path>", "Migrate from old configuration")
    .action(async (options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleConfig(options, globalOptions);
    });
  return command;
}

/**
 * Create stats command
 */
export function createStatsCommand(): Command {
  const command = new Command("stats");
  command
    .description("Show system statistics")
    .option("-j, --json", "Output as JSON")
    .action(async (options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleStats(options, globalOptions);
    });
  return command;
}

/**
 * Create start-multiple command
 */
export function createStartMultipleCommand(): Command {
  const command = new Command("start-multiple");
  command.description("Start multiple servers interactively").action(async () => {
    const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
    await handleStartMultiple(globalOptions);
  });
  return command;
}

/**
 * Create stop-all command
 */
export function createStopAllCommand(): Command {
  const command = new Command("stop-all");
  command
    .description("Stop all running servers")
    .option("-f, --force", "Force stop all servers")
    .action(async (options: any) => {
      const globalOptions: GlobalOptions = { config: "dev-server.config.json", verbose: false };
      await handleStopAll(options, globalOptions);
    });
  return command;
}
