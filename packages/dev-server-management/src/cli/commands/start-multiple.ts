/**
 * 🦊 Dev Server Management CLI - Start Multiple Command
 * 
 * Handles starting multiple servers interactively.
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { DevServerManager } from '../../core/DevServerManager.js';
import type { GlobalOptions } from './types.js';

export async function handleStartMultiple(
  globalOptions: GlobalOptions
): Promise<void> {
  const manager = new DevServerManager(globalOptions.config);
  
  try {
    await manager.initialize();
    
    const projects = await manager.list();
    
    const { selectedProjects } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedProjects',
        message: 'Select projects to start:',
        choices: projects.map(p => ({
          name: `${p.name} (${p.port}) - ${p.description}`,
          value: p.name,
        })),
      },
    ]);
    
    if (selectedProjects.length === 0) {
      console.log(chalk.yellow('No projects selected'));
      return;
    }
    
    const spinner = ora(`Starting ${selectedProjects.length} projects...`).start();
    
    await manager.startMultiple(selectedProjects);
    
    spinner.succeed(chalk.green(`✅ Started ${selectedProjects.length} projects successfully`));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to start projects:'), error);
    process.exit(1);
  }
}
