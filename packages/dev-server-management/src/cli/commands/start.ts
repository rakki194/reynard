/**
 * 🦊 Dev Server Management CLI - Start Command
 *
 * Handles starting development servers.
 */

import chalk from "chalk";
import ora from "ora";
import { DevServerManager } from "../../core/DevServerManager.js";
import { createStatusTable } from "../utils/table.js";
import type { StartOptions, GlobalOptions } from "./types.js";

export async function handleStart(project: string, options: StartOptions, globalOptions: GlobalOptions): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);

  try {
    await manager.initialize();

    const spinner = ora(`Starting ${project}...`).start();

    await manager.start(project);

    spinner.succeed(chalk.green(`✅ ${project} started successfully`));

    if (globalOptions.verbose) {
      const status = await manager.status(project);
      console.log(createStatusTable(status));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Failed to start ${project}:`), error);
    process.exit(1);
  }
}
