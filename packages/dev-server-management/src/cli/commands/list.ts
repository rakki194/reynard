/**
 * 🦊 Dev Server Management CLI - List Command
 * 
 * Handles listing available projects.
 */

import chalk from 'chalk';
import { DevServerManager } from '../../core/DevServerManager.js';
import { createTable } from '../utils/table.js';
import type { ListOptions, GlobalOptions } from './types.js';

export async function handleList(
  options: ListOptions, 
  globalOptions: GlobalOptions
): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);
  
  try {
    await manager.initialize();
    
    const projects = await manager.list();
    const filteredProjects = options.category 
      ? projects.filter(p => p.category === options.category)
      : projects;
    
    if (options.json) {
      console.log(JSON.stringify(filteredProjects, null, 2));
    } else {
      console.log(createTable(filteredProjects, [
        { key: 'name', header: 'Project' },
        { key: 'port', header: 'Port' },
        { key: 'category', header: 'Category' },
        { key: 'description', header: 'Description' },
      ]));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to list projects:'), error);
    process.exit(1);
  }
}
