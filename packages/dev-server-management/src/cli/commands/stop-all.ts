/**
 * 🦊 Dev Server Management CLI - Stop All Command
 *
 * Handles stopping all running servers.
 */

import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { DevServerManager } from "../../core/DevServerManager.js";
import type { StopAllOptions, GlobalOptions } from "./types.js";

export async function handleStopAll(options: StopAllOptions, globalOptions: GlobalOptions): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);

  try {
    await manager.initialize();

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to stop all servers?",
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Operation cancelled"));
      return;
    }

    const spinner = ora("Stopping all servers...").start();

    await manager.stopAll();

    spinner.succeed(chalk.green("✅ All servers stopped successfully"));
  } catch (error) {
    console.error(chalk.red("❌ Failed to stop all servers:"), error);
    process.exit(1);
  }
}
