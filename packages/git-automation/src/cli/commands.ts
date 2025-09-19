/**
 * 🦊 CLI Commands
 *
 * Command implementations for the CLI interface
 */

import chalk from "chalk";
import {
  JunkFileDetector,
  ChangeAnalyzer,
  CommitMessageGenerator,
  ChangelogManager,
  VersionManager,
  GitWorkflowOrchestrator,
  type WorkflowOptions,
} from "../index.js";

export class CLICommands {
  /**
   * Junk detection command
   */
  static async junkDetection(options: { cleanup?: boolean; force?: boolean; dryRun?: boolean }): Promise<void> {
    try {
      const detector = new JunkFileDetector();
      const result = await detector.detectJunkFiles();

      detector.displayResults(result);

      if (options.cleanup && result.hasJunk) {
        await detector.cleanupJunkFiles(result, options.dryRun);
      }
    } catch (error) {
      console.error(chalk.red("❌ Junk detection failed:"), error);
      process.exit(1);
    }
  }

  /**
   * Change analysis command
   */
  static async changeAnalysis(options: { workingDir?: string; output?: string }): Promise<void> {
    try {
      const analyzer = new ChangeAnalyzer();
      const _result = await analyzer.analyzeChanges(options.workingDir);

      if (options.output) {
        // TODO: Implement output to file
        console.log(chalk.yellow("Output to file not yet implemented"));
      }
    } catch (error) {
      console.error(chalk.red("❌ Change analysis failed:"), error);
      process.exit(1);
    }
  }

  /**
   * Commit message generation command
   */
  static async commitMessage(options: { workingDir?: string; preview?: boolean }): Promise<void> {
    try {
      const analyzer = new ChangeAnalyzer();
      const generator = new CommitMessageGenerator();

      const analysis = await analyzer.analyzeChanges(options.workingDir);
      const message = generator.generateCommitMessage(analysis);

      if (options.preview) {
        generator.displayPreview(message);
      } else {
        console.log(message.fullMessage);
      }
    } catch (error) {
      console.error(chalk.red("❌ Commit message generation failed:"), error);
      process.exit(1);
    }
  }

  /**
   * Changelog management command
   */
  static async changelogManagement(options: {
    action: string;
    version?: string;
    entry?: string;
    type?: string;
    workingDir?: string;
  }): Promise<void> {
    try {
      const manager = new ChangelogManager(options.workingDir);

      switch (options.action) {
        case "read":
          const _structure = await manager.readChangelog();
          console.log(chalk.blue("📚 Changelog structure loaded"));
          break;

        case "add":
          if (!options.entry || !options.type) {
            console.error(chalk.red("❌ Entry and type are required for add action"));
            process.exit(1);
          }
          await manager.addEntry({
            type: options.type as "added" | "changed" | "deprecated" | "removed" | "fixed" | "security",
            description: options.entry,
          });
          break;

        case "promote":
          if (!options.version) {
            console.error(chalk.red("❌ Version is required for promote action"));
            process.exit(1);
          }
          await manager.promoteToVersion(options.version);
          break;

        default:
          console.error(chalk.red(`❌ Unknown action: ${options.action}`));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("❌ Changelog management failed:"), error);
      process.exit(1);
    }
  }

  /**
   * Version management command
   */
  static async versionManagement(options: { action: string; version?: string; workingDir?: string }): Promise<void> {
    try {
      const manager = new VersionManager(options.workingDir);

      switch (options.action) {
        case "current":
          const current = manager.getCurrentVersion();
          console.log(chalk.blue(`📦 Current version: ${current}`));
          break;

        case "bump":
          if (!options.version) {
            console.error(chalk.red("❌ Version is required for bump action"));
            process.exit(1);
          }
          await manager.bumpVersion(options.version as "major" | "minor" | "patch");
          break;

        default:
          console.error(chalk.red(`❌ Unknown action: ${options.action}`));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("❌ Version management failed:"), error);
      process.exit(1);
    }
  }

  /**
   * Workflow orchestration command
   */
  static async workflowOrchestration(options: WorkflowOptions): Promise<void> {
    try {
      const orchestrator = new GitWorkflowOrchestrator();
      await orchestrator.executeWorkflow(options);
    } catch (error) {
      console.error(chalk.red("❌ Workflow orchestration failed:"), error);
      process.exit(1);
    }
  }
}
