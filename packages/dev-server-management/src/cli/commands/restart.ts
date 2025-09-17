/**
 * 🦊 Dev Server Management CLI - Restart Command
 *
 * Handles restarting development servers.
 */

import chalk from "chalk";
import ora from "ora";
import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export async function handleRestart(project: string, globalOptions: GlobalOptions): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);

  try {
    await manager.initialize();

    const spinner = ora(`Restarting ${project}...`).start();

    await manager.restart(project);

    spinner.succeed(chalk.green(`✅ ${project} restarted successfully`));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to restart ${project}:`), error);
    process.exit(1);
  }
}
