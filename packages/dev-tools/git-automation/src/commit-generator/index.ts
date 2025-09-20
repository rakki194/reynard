/**
 * 🦊 Commit Message Generator
 *
 * Main entry point for the commit message generator module
 */

import type { ChangeAnalysisResult } from "../change-analyzer/types";
import chalk from "chalk";
import { CommitMessageAnalyzer } from "./analyzer";
import { CommitMessageFormatter } from "./formatter";
import type { CommitMessage, CommitMessageOptions } from "./types";

export class CommitMessageGenerator {
  private readonly defaultOptions: CommitMessageOptions = {
    includeBody: true,
    includeFooter: true,
    maxBodyLength: 100,
    includeBreakingChanges: true,
    includeIssueReferences: true,
  };

  private analyzer = new CommitMessageAnalyzer();
  private formatter = new CommitMessageFormatter();

  /**
   * Generate commit message from change analysis
   */
  generateCommitMessage(analysis: ChangeAnalysisResult, options: Partial<CommitMessageOptions> = {}): CommitMessage {
    const opts = { ...this.defaultOptions, ...options };

    // Determine primary type and scope
    const { type, scope } = this.analyzer.determineTypeAndScope(analysis);

    // Generate description
    const description = this.analyzer.generateDescription(analysis, type);

    // Generate body
    const body = opts.includeBody ? this.analyzer.generateBody(analysis, opts.maxBodyLength) : undefined;

    // Generate footer
    const footer = opts.includeFooter ? this.analyzer.generateFooter(analysis) : undefined;

    // Format final message
    const message = this.formatter.formatCommitMessage(type, scope, description, body, footer, opts);

    // Validate message
    const validation = this.formatter.validateCommitMessage(message);
    if (!validation.valid) {
      console.warn(chalk.yellow("⚠️  Commit message validation warnings:"));
      validation.errors.forEach(error => console.warn(chalk.yellow(`  - ${error}`)));
    }

    return message;
  }

  /**
   * Display commit message preview
   */
  displayPreview(message: CommitMessage): void {
    console.log(chalk.blue("\n📝 Commit Message Preview:"));
    console.log(chalk.blue("=".repeat(40)));
    console.log(chalk.cyan(message.fullMessage));
    console.log(chalk.blue("=".repeat(40)));
  }

  /**
   * Get commit message statistics
   */
  getStatistics(message: CommitMessage): {
    headerLength: number;
    bodyLength: number;
    footerLength: number;
    totalLength: number;
  } {
    const headerLength =
      message.type.length + (message.scope ? message.scope.length + 3 : 0) + message.description.length + 2;

    return {
      headerLength,
      bodyLength: message.body?.length || 0,
      footerLength: message.footer?.length || 0,
      totalLength: message.fullMessage.length,
    };
  }
}

// Re-export types
export * from "./types";
