/**
 * 🦊 Dev Server Management CLI - Stop Command
 * 
 * Handles stopping development servers.
 */

import chalk from 'chalk';
import ora from 'ora';
import { DevServerManager } from '../../core/DevServerManager.js';
import type { StopOptions, GlobalOptions } from './types.js';

export async function handleStop(
  project: string, 
  options: StopOptions, 
  globalOptions: GlobalOptions
): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);
  
  try {
    await manager.initialize();
    
    const spinner = ora(`Stopping ${project}...`).start();
    
    await manager.stop(project);
    
    spinner.succeed(chalk.green(`✅ ${project} stopped successfully`));
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to stop ${project}:`), error);
    process.exit(1);
  }
}
