/**
 * 🦊 Workflow Orchestrator
 *
 * Orchestrates the complete Git workflow
 */

import chalk from "chalk";
import ora from "ora";
import { ChangeAnalyzer } from "../change-analyzer";
import { CommitMessageGenerator } from "../commit-generator";
import { ChangelogManager } from "../changelog-manager";
import { VersionManager } from "../version-manager";
import type { WorkflowOptions } from "./types";

export class GitWorkflowOrchestrator {
  /**
   * Execute complete Git workflow
   */
  async executeWorkflow(options: WorkflowOptions): Promise<void> {
    const spinner = ora("🦊 Executing Git workflow...").start();

    try {
      const workingDir = options.workingDir || ".";

      // Step 1: Analyze changes
      const analyzer = new ChangeAnalyzer();
      const analysis = await analyzer.analyzeChanges(workingDir);

      if (analysis.totalFiles === 0) {
        spinner.succeed("No changes detected");
        return;
      }

      // Step 2: Generate commit message
      if (options.commit) {
        const generator = new CommitMessageGenerator();
        const message = generator.generateCommitMessage(analysis);

        if (options.dryRun) {
          console.log(chalk.yellow("Would commit with message:"));
          console.log(message.fullMessage);
        } else {
          // TODO: Implement actual commit
          console.log(chalk.blue("Commit message generated"));
        }
      }

      // Step 3: Update changelog
      if (options.changelog) {
        const _changelogManager = new ChangelogManager(workingDir);

        if (options.dryRun) {
          console.log(chalk.yellow("Would update changelog"));
        } else {
          // TODO: Implement changelog update
          console.log(chalk.blue("Changelog would be updated"));
        }
      }

      // Step 4: Bump version
      if (options.version) {
        const versionManager = new VersionManager(workingDir);

        if (options.dryRun) {
          const versionInfo = versionManager.getVersionInfo(analysis);
          console.log(chalk.yellow(`Would bump version from ${versionInfo.current} to ${versionInfo.next}`));
        } else {
          await versionManager.bumpVersion(analysis.versionBumpType);
        }
      }

      spinner.succeed("Git workflow completed successfully");
    } catch (error) {
      spinner.fail("Git workflow failed");
      throw error;
    }
  }
}
