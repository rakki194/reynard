/**
 * 🦊 Dev Server Management CLI - Health Command
 * 
 * Handles showing health status information.
 */

import chalk from 'chalk';
import { DevServerManager } from '../../core/DevServerManager.js';
import { createHealthTable } from '../utils/table.js';
import type { HealthOptions, GlobalOptions } from './types.js';

export async function handleHealth(
  project: string | undefined, 
  options: HealthOptions, 
  globalOptions: GlobalOptions
): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);
  
  try {
    await manager.initialize();
    
    const showHealth = async () => {
      const health = await manager.health(project);
      if (options.json) {
        console.log(JSON.stringify(health, null, 2));
      } else {
        console.clear();
        console.log(chalk.blue('🦊 Dev Server Management Health Status'));
        console.log(createHealthTable(health));
      }
    };
    
    if (options.watch) {
      console.log(chalk.blue('🦊 Watching health status (Ctrl+C to stop)'));
      await showHealth();
      
      setInterval(showHealth, 5000);
    } else {
      await showHealth();
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to get health status:'), error);
    process.exit(1);
  }
}
