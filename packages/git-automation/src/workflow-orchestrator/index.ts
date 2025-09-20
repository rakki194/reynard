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
import { JunkFileDetector } from "../junk-detector";
import type { WorkflowOptions } from "./types";

export class GitWorkflowOrchestrator {
  private junkDetector: JunkFileDetector;
  private changeAnalyzer: ChangeAnalyzer;
  private commitGenerator: CommitMessageGenerator;
  private versionManager: VersionManager;
  private changelogManager: ChangelogManager;

  constructor(
    junkDetector?: JunkFileDetector,
    changeAnalyzer?: ChangeAnalyzer,
    commitGenerator?: CommitMessageGenerator,
    versionManager?: VersionManager,
    changelogManager?: ChangelogManager
  ) {
    this.junkDetector = junkDetector || new JunkFileDetector();
    this.changeAnalyzer = changeAnalyzer || new ChangeAnalyzer();
    this.commitGenerator = commitGenerator || new CommitMessageGenerator();
    this.versionManager = versionManager || new VersionManager();
    this.changelogManager = changelogManager || new ChangelogManager();
  }

  /**
   * Execute complete Git workflow
   */
  async executeWorkflow(options: WorkflowOptions): Promise<void> {
    const spinner = ora("🦊 Executing Git workflow...").start();

    try {
      const workingDir = options.workingDir || ".";

      // Step 1: Detect and clean junk files
      if (options.cleanup) {
        const junkResult = await this.junkDetector.detectJunkFiles(workingDir);
        if (junkResult.hasJunk) {
          if (options.dryRun) {
            console.log(chalk.yellow("Would clean up junk files"));
          } else {
            await this.junkDetector.cleanupJunkFiles(junkResult);
          }
        }
      }

      // Step 2: Analyze changes
      const analysis = await this.changeAnalyzer.analyzeChanges(workingDir);

      if (analysis.totalFiles === 0) {
        spinner.succeed("No changes detected");
        return;
      }

      // Step 3: Generate commit message
      if (options.commit) {
        const message = this.commitGenerator.generateCommitMessage(analysis);

        if (options.dryRun) {
          console.log(chalk.yellow("Would commit with message:"));
          console.log(message.fullMessage);
        } else {
          // TODO: Implement actual commit
          console.log(chalk.blue("Commit message generated"));
        }
      }

      // Step 4: Update changelog
      if (options.changelog) {
        if (options.dryRun) {
          console.log(chalk.yellow("Would update changelog"));
        } else {
          // Get version info for changelog update
          const versionInfo = await this.versionManager.getVersionInfo(analysis);
          await this.changelogManager.promoteToVersion(versionInfo.next);
        }
      }

      // Step 5: Bump version
      if (options.version) {
        const versionInfo = await this.versionManager.getVersionInfo(analysis);
        if (options.dryRun) {
          console.log(chalk.yellow(`Would bump version from ${versionInfo.current} to ${versionInfo.next}`));
        } else {
          await this.versionManager.bumpVersion(analysis.versionBumpType);
        }
      }

      spinner.succeed("Git workflow completed successfully");
    } catch (error) {
      spinner.fail("Git workflow failed");
      throw error;
    }
  }
}
