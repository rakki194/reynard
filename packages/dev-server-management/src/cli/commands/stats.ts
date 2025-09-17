/**
 * 🦊 Dev Server Management CLI - Stats Command
 * 
 * Handles showing system statistics.
 */

import chalk from 'chalk';
import { DevServerManager } from '../../core/DevServerManager.js';
import type { StatsOptions, GlobalOptions } from './types.js';

export async function handleStats(
  options: StatsOptions, 
  globalOptions: GlobalOptions
): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);
  
  try {
    await manager.initialize();
    
    const stats = manager.getStats();
    
    if (options.json) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.log(chalk.blue('🦊 Dev Server Management Statistics'));
      console.log();
      console.log(chalk.cyan('System Status:'));
      console.log(`  Initialized: ${stats.isInitialized ? chalk.green('✅') : chalk.red('❌')}`);
      console.log(`  Total Projects: ${chalk.yellow(stats.totalProjects)}`);
      console.log(`  Running Projects: ${chalk.green(stats.runningProjects)}`);
      console.log();
      console.log(chalk.cyan('Process Statistics:'));
      console.log(`  Total Processes: ${stats.processStats.totalProcesses}`);
      console.log(`  Running: ${chalk.green(stats.processStats.runningProcesses)}`);
      console.log(`  Stopped: ${chalk.yellow(stats.processStats.stoppedProcesses)}`);
      console.log(`  Errors: ${chalk.red(stats.processStats.errorProcesses)}`);
      console.log();
      console.log(chalk.cyan('Health Statistics:'));
      console.log(`  Total: ${stats.healthStats.total}`);
      console.log(`  Healthy: ${chalk.green(stats.healthStats.healthy)}`);
      console.log(`  Unhealthy: ${chalk.red(stats.healthStats.unhealthy)}`);
      console.log(`  Unknown: ${chalk.yellow(stats.healthStats.unknown)}`);
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to get statistics:'), error);
    process.exit(1);
  }
}
