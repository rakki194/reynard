/**
 * 🦊 Dev Server Management CLI - Status Command
 * 
 * Handles showing server status information.
 */

import chalk from 'chalk';
import { DevServerManager } from '../../core/DevServerManager.js';
import { createStatusTable, createHealthTable } from '../utils/table.js';
import type { StatusOptions, GlobalOptions } from './types.js';

export async function handleStatus(
  project: string | undefined, 
  options: StatusOptions, 
  globalOptions: GlobalOptions
): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);
  
  try {
    await manager.initialize();
    
    if (options.health) {
      const health = await manager.health(project);
      if (options.json) {
        console.log(JSON.stringify(health, null, 2));
      } else {
        console.log(createHealthTable(health));
      }
    } else {
      const status = await manager.status(project);
      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        console.log(createStatusTable(status));
      }
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to get status:'), error);
    process.exit(1);
  }
}
