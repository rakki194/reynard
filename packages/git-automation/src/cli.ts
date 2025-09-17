#!/usr/bin/env node
/**
 * 🦊 Reynard Git Automation CLI
 * 
 * Command-line interface for the Reynard Git automation tools.
 * Provides easy access to all workflow components and operations.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  JunkFileDetector,
  ChangeAnalyzer,
  CommitMessageGenerator,
  ChangelogManager,
  VersionManager,
  GitWorkflowOrchestrator,
  type WorkflowOptions
} from './index.js';

const program = new Command();

program
  .name('reynard-git')
  .description('🦊 Reynard Git workflow automation tools')
  .version('0.1.0');

// Junk Detection Command
program
  .command('junk')
  .description('Detect and analyze junk files in the repository')
  .option('-c, --cleanup', 'Clean up detected junk files')
  .option('-f, --force', 'Force cleanup without confirmation')
  .option('-d, --dry-run', 'Show what would be cleaned up without actually doing it')
  .action(async (options) => {
    try {
      const detector = new JunkFileDetector();
      const result = await detector.detectJunkFiles();
      
      detector.displayResults(result);
      
      if (options.cleanup && result.hasJunk) {
        await detector.cleanupJunkFiles(result, options.dryRun);
      }
    } catch (error) {
      console.error(chalk.red('❌ Junk detection failed:'), error);
      process.exit(1);
    }
  });

// Change Analysis Command
program
  .command('analyze')
  .description('Analyze Git changes and determine impact')
  .action(async () => {
    try {
      const analyzer = new ChangeAnalyzer();
      const result = await analyzer.analyzeChanges();
      
      analyzer.displayResults(result);
    } catch (error) {
      console.error(chalk.red('❌ Change analysis failed:'), error);
      process.exit(1);
    }
  });

// Commit Generation Command
program
  .command('commit')
  .description('Generate conventional commit message from changes')
  .option('-b, --body', 'Include detailed body in commit message')
  .option('-f, --footer', 'Include footer with additional information')
  .action(async (options) => {
    try {
      const analyzer = new ChangeAnalyzer();
      const generator = new CommitMessageGenerator();
      
      const analysis = await analyzer.analyzeChanges();
      const commitMessage = generator.generateCommitMessage(analysis, {
        includeBody: options.body,
        includeFooter: options.footer
      });
      
      generator.displayCommitMessage(commitMessage);
    } catch (error) {
      console.error(chalk.red('❌ Commit generation failed:'), error);
      process.exit(1);
    }
  });

// Changelog Management Command
program
  .command('changelog')
  .description('Manage CHANGELOG.md file')
  .option('-v, --version <version>', 'Version to promote unreleased changes to')
  .option('-d, --date <date>', 'Date for the version (YYYY-MM-DD)')
  .option('--validate', 'Validate changelog structure')
  .action(async (options) => {
    try {
      const manager = new ChangelogManager();
      
      if (options.validate) {
        const validation = await manager.validateChangelog();
        if (validation.valid) {
          console.log(chalk.green('✅ CHANGELOG.md structure is valid'));
        } else {
          console.log(chalk.red('❌ CHANGELOG.md has issues:'));
          validation.issues.forEach(issue => {
            console.log(chalk.red(`  - ${issue}`));
          });
          process.exit(1);
        }
      } else if (options.version) {
        const date = options.date || manager.getCurrentDate();
        await manager.promoteUnreleasedToRelease(options.version, date);
        console.log(chalk.green(`✅ Promoted unreleased changes to v${options.version}`));
      } else {
        const structure = await manager.readChangelog();
        manager.displayChangelog(structure);
      }
    } catch (error) {
      console.error(chalk.red('❌ Changelog operation failed:'), error);
      process.exit(1);
    }
  });

// Version Management Command
program
  .command('version')
  .description('Manage package versions and Git tags')
  .option('-b, --bump <type>', 'Bump version type (major, minor, patch)')
  .option('-t, --tag', 'Create Git tag for version')
  .option('-p, --push', 'Push Git tag to remote')
  .option('--monorepo', 'Update all packages in monorepo')
  .action(async (options) => {
    try {
      const manager = new VersionManager();
      
      if (options.bump) {
        const currentVersion = await manager.getCurrentVersion();
        const nextVersion = manager.calculateNextVersion(currentVersion, options.bump);
        
        if (options.monorepo) {
          await manager.updateMonorepoVersions(options.bump);
        } else {
          await manager.updateVersion(nextVersion);
        }
        
        console.log(chalk.green(`✅ Version bumped: ${currentVersion} → ${nextVersion}`));
        
        if (options.tag) {
          const releaseNotes = await manager.generateReleaseNotes(nextVersion);
          await manager.createGitTag(nextVersion, releaseNotes);
          console.log(chalk.green(`✅ Created Git tag v${nextVersion}`));
          
          if (options.push) {
            await manager.pushGitTag(nextVersion);
            console.log(chalk.green(`✅ Pushed Git tag v${nextVersion}`));
          }
        }
      } else {
        const currentVersion = await manager.getCurrentVersion();
        const tags = await manager.getGitTags();
        
        console.log(chalk.cyan(`Current version: ${currentVersion}`));
        console.log(chalk.cyan(`Git tags: ${tags.length > 0 ? tags.slice(0, 5).join(', ') : 'none'}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Version operation failed:'), error);
      process.exit(1);
    }
  });

// Complete Workflow Command
program
  .command('workflow')
  .description('Execute complete Git workflow automation')
  .option('--skip-junk', 'Skip junk file detection')
  .option('--skip-analysis', 'Skip change analysis')
  .option('--skip-commit', 'Skip commit message generation')
  .option('--skip-version', 'Skip version bump')
  .option('--skip-changelog', 'Skip changelog update')
  .option('--skip-tag', 'Skip Git tag creation')
  .option('--dry-run', 'Show what would be done without executing')
  .option('--auto-confirm', 'Skip all confirmations')
  .option('-m, --message <message>', 'Custom commit message')
  .option('-b, --bump <type>', 'Version bump type (major, minor, patch)')
  .action(async (options) => {
    try {
      const orchestrator = new GitWorkflowOrchestrator();
      
      const workflowOptions: Partial<WorkflowOptions> = {
        skipJunkDetection: options.skipJunk,
        skipChangeAnalysis: options.skipAnalysis,
        skipCommitGeneration: options.skipCommit,
        skipVersionBump: options.skipVersion,
        skipChangelogUpdate: options.skipChangelog,
        skipGitTag: options.skipTag,
        dryRun: options.dryRun,
        autoConfirm: options.autoConfirm,
        commitMessage: options.message,
        versionBumpType: options.bump
      };
      
      const result = await orchestrator.executeWorkflow(workflowOptions);
      orchestrator.displayWorkflowSummary(result);
      
      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Workflow execution failed:'), error);
      process.exit(1);
    }
  });

// Quick Commands
program
  .command('quick')
  .description('Quick workflow with minimal prompts')
  .action(async () => {
    try {
      const orchestrator = new GitWorkflowOrchestrator();
      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: false
      });
      
      orchestrator.displayWorkflowSummary(result);
      
      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Quick workflow failed:'), error);
      process.exit(1);
    }
  });

// Help Command
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    console.log(chalk.blue('🦊 Reynard Git Automation Help'));
    console.log(chalk.blue('='.repeat(40)));
    console.log();
    console.log(chalk.cyan('Available Commands:'));
    console.log(chalk.gray('  junk        - Detect and clean junk files'));
    console.log(chalk.gray('  analyze     - Analyze Git changes'));
    console.log(chalk.gray('  commit      - Generate commit message'));
    console.log(chalk.gray('  changelog   - Manage CHANGELOG.md'));
    console.log(chalk.gray('  version     - Manage versions and tags'));
    console.log(chalk.gray('  workflow    - Complete automation workflow'));
    console.log(chalk.gray('  quick       - Quick workflow with auto-confirm'));
    console.log();
    console.log(chalk.cyan('Examples:'));
    console.log(chalk.gray('  reynard-git workflow --dry-run'));
    console.log(chalk.gray('  reynard-git quick'));
    console.log(chalk.gray('  reynard-git junk --cleanup'));
    console.log(chalk.gray('  reynard-git version --bump minor --tag --push'));
    console.log();
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
