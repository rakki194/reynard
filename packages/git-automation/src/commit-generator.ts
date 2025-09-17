/**
 * 🦊 Commit Message Generator
 *
 * Modular component for generating conventional commit messages
 * based on change analysis results.
 */

import type { ChangeAnalysisResult } from "./change-analyzer.js";
import chalk from "chalk";

export interface CommitMessageOptions {
  includeBody: boolean;
  includeFooter: boolean;
  maxBodyLength: number;
  includeBreakingChanges: boolean;
  includeIssueReferences: boolean;
}

export interface CommitMessage {
  type: string;
  scope?: string;
  description: string;
  body?: string;
  footer?: string;
  fullMessage: string;
}

export class CommitMessageGenerator {
  private readonly defaultOptions: CommitMessageOptions = {
    includeBody: true,
    includeFooter: true,
    maxBodyLength: 100,
    includeBreakingChanges: true,
    includeIssueReferences: true,
  };

  /**
   * Generate commit message from change analysis
   */
  generateCommitMessage(analysis: ChangeAnalysisResult, options: Partial<CommitMessageOptions> = {}): CommitMessage {
    const opts = { ...this.defaultOptions, ...options };

    // Determine primary type and scope
    const { type, scope } = this.determineTypeAndScope(analysis);

    // Generate description
    const description = this.generateDescription(analysis, type);

    // Generate body
    const body = opts.includeBody ? this.generateBody(analysis, opts) : undefined;

    // Generate footer
    const footer = opts.includeFooter ? this.generateFooter(analysis, opts) : undefined;

    // Construct full message
    const fullMessage = this.constructFullMessage(type, scope, description, body, footer);

    return {
      type,
      scope,
      description,
      body,
      footer,
      fullMessage,
    };
  }

  /**
   * Determine commit type and scope from analysis
   */
  private determineTypeAndScope(analysis: ChangeAnalysisResult): { type: string; scope?: string } {
    // Check for breaking changes first
    if (analysis.hasBreakingChanges) {
      return { type: "feat!", scope: this.determineScope(analysis) };
    }

    // Check for features
    const featureCategory = analysis.categories.find(cat => cat.type === "feature");
    if (featureCategory) {
      return { type: "feat", scope: this.determineScope(analysis) };
    }

    // Check for fixes
    const fixCategory = analysis.categories.find(cat => cat.type === "fix");
    if (fixCategory) {
      return { type: "fix", scope: this.determineScope(analysis) };
    }

    // Check for performance improvements
    const perfCategory = analysis.categories.find(cat => cat.type === "perf");
    if (perfCategory) {
      return { type: "perf", scope: this.determineScope(analysis) };
    }

    // Check for documentation
    const docsCategory = analysis.categories.find(cat => cat.type === "docs");
    if (docsCategory) {
      return { type: "docs", scope: this.determineScope(analysis) };
    }

    // Check for tests
    const testCategory = analysis.categories.find(cat => cat.type === "test");
    if (testCategory) {
      return { type: "test", scope: this.determineScope(analysis) };
    }

    // Check for refactoring
    const refactorCategory = analysis.categories.find(cat => cat.type === "refactor");
    if (refactorCategory) {
      return { type: "refactor", scope: this.determineScope(analysis) };
    }

    // Check for style changes
    const styleCategory = analysis.categories.find(cat => cat.type === "style");
    if (styleCategory) {
      return { type: "style", scope: this.determineScope(analysis) };
    }

    // Default to chore
    return { type: "chore", scope: this.determineScope(analysis) };
  }

  /**
   * Determine scope from file changes
   */
  private determineScope(analysis: ChangeAnalysisResult): string | undefined {
    const scopes = new Set<string>();

    for (const category of analysis.categories) {
      for (const file of category.files) {
        const scope = this.extractScopeFromFile(file.file);
        if (scope) {
          scopes.add(scope);
        }
      }
    }

    // Return the most common scope, or undefined if multiple
    if (scopes.size === 1) {
      return Array.from(scopes)[0];
    }

    // If multiple scopes, prioritize performance-related scopes
    if (scopes.size > 1) {
      const scopeArray = Array.from(scopes);
      
      // Prioritize performance-related scopes
      if (scopeArray.includes("perf")) {
        return "perf";
      }
      
      // Try to find a common parent
      const commonScope = this.findCommonScope(scopeArray);
      if (commonScope) {
        return commonScope;
      }
    }

    return undefined;
  }

  /**
   * Extract scope from file path
   */
  private extractScopeFromFile(filePath: string): string | undefined {
    const pathParts = filePath.split("/");

    // Check for package-based scopes
    if (pathParts[0] === "packages" && pathParts.length > 1) {
      return pathParts[1].replace("reynard-", "");
    }

    // Check for service-based scopes
    if (pathParts[0] === "services" && pathParts.length > 1) {
      return pathParts[1];
    }

    // Check for backend scopes
    if (pathParts[0] === "backend") {
      return "backend";
    }

    // Check for frontend scopes
    if (pathParts[0] === "frontend") {
      return "frontend";
    }
    
    // Check for src-based scopes (more specific)
    if (pathParts[0] === "src" && pathParts.length > 1) {
      // Handle special cases for test files
      if (pathParts[1] === "__tests__") {
        return "test";
      }
      // Handle performance files
      if (pathParts[1] === "perf" || filePath.includes("performance")) {
        return "perf";
      }
      return pathParts[1]; // Return the subdirectory (e.g., "components", "utils")
    }

    // Check for documentation scopes
    if (pathParts[0] === "docs") {
      return "docs";
    }

    // Check for configuration scopes
    if (filePath.includes("config") || filePath.includes("package.json")) {
      return "config";
    }

    return undefined;
  }

  /**
   * Find common scope from multiple scopes
   */
  private findCommonScope(scopes: string[]): string | undefined {
    // If all scopes are related to the same package
    const packageScopes = scopes.filter(scope => ["core", "components", "utils", "testing"].includes(scope));

    if (packageScopes.length === scopes.length) {
      return "packages";
    }

    // If all scopes are related to services
    const serviceScopes = scopes.filter(scope =>
      ["mcp-server", "ecs-world", "gatekeeper", "agent-naming"].includes(scope)
    );

    if (serviceScopes.length === scopes.length) {
      return "services";
    }

    return undefined;
  }

  /**
   * Generate commit description
   */
  private generateDescription(analysis: ChangeAnalysisResult, type: string): string {
    const descriptions: string[] = [];

    // Add primary description based on type
    switch (type) {
      case "feat":
      case "feat!":
        descriptions.push("add new features and capabilities");
        break;
      case "fix":
        descriptions.push("fix bugs and resolve issues");
        break;
      case "perf":
        descriptions.push("improve performance and optimization");
        break;
      case "docs":
        descriptions.push("update documentation and guides");
        break;
      case "test":
        descriptions.push("enhance test coverage and quality");
        break;
      case "refactor":
        descriptions.push("refactor code for better maintainability");
        break;
      case "style":
        descriptions.push("improve code style and formatting");
        break;
      case "chore":
        descriptions.push("update configuration and maintenance");
        break;
    }

    // Add specific details based on categories
    const categoryDescriptions = analysis.categories.map(cat => {
      switch (cat.type) {
        case "feature":
          return `enhanced ${cat.files.length} feature files`;
        case "fix":
          return `resolved ${cat.files.length} issue files`;
        case "docs":
          return `updated ${cat.files.length} documentation files`;
        case "test":
          return `improved ${cat.files.length} test files`;
        case "refactor":
          return `refactored ${cat.files.length} source files`;
        case "perf":
          return `optimized ${cat.files.length} performance files`;
        case "style":
          return `styled ${cat.files.length} style files`;
        case "chore":
          return `maintained ${cat.files.length} configuration files`;
        default:
          return `updated ${cat.files.length} files`;
      }
    });

    if (categoryDescriptions.length > 0) {
      descriptions.push(categoryDescriptions.join(", "));
    }

    // Add impact information
    if (analysis.hasBreakingChanges) {
      descriptions.push("with breaking changes");
    }

    if (analysis.securityChanges) {
      descriptions.push("with security improvements");
    }

    if (analysis.performanceChanges) {
      descriptions.push("with performance enhancements");
    }

    return descriptions.join(" ");
  }

  /**
   * Generate commit body
   */
  private generateBody(analysis: ChangeAnalysisResult, options: CommitMessageOptions): string {
    const bodyLines: string[] = [];

    // Add detailed change information
    for (const category of analysis.categories) {
      if (category.files.length > 0) {
        bodyLines.push(`- ${category.description}`);

        // Add specific file examples (max 3)
        const examples = category.files.slice(0, 3);
        for (const file of examples) {
          bodyLines.push(`  - ${file.file}`);
        }

        if (category.files.length > 3) {
          bodyLines.push(`  - ... and ${category.files.length - 3} more files`);
        }
      }
    }

    // Add impact summary
    if (analysis.hasBreakingChanges || analysis.securityChanges || analysis.performanceChanges) {
      bodyLines.push("");
      bodyLines.push("Impact:");

      if (analysis.hasBreakingChanges) {
        bodyLines.push("- Breaking changes require major version bump");
      }

      if (analysis.securityChanges) {
        bodyLines.push("- Security improvements enhance system safety");
      }

      if (analysis.performanceChanges) {
        bodyLines.push("- Performance optimizations improve efficiency");
      }
    }

    // Truncate if too long
    const body = bodyLines.join("\n");
    if (body.length > options.maxBodyLength) {
      return body.substring(0, options.maxBodyLength) + "...";
    }

    return body;
  }

  /**
   * Generate commit footer
   */
  private generateFooter(analysis: ChangeAnalysisResult, options: CommitMessageOptions): string {
    const footerLines: string[] = [];

    // Add breaking changes
    if (options.includeBreakingChanges && analysis.hasBreakingChanges) {
      footerLines.push("BREAKING CHANGE: This commit includes breaking changes that require a major version bump");
    }

    // Add issue references (placeholder for now)
    if (options.includeIssueReferences) {
      // This would typically extract issue numbers from commit messages or PR references
      // For now, we'll add a placeholder
      footerLines.push("Refs: #TODO");
    }

    // Add version bump information
    footerLines.push(`Version bump: ${analysis.versionBumpType}`);

    return footerLines.join("\n");
  }

  /**
   * Construct the full commit message
   */
  private constructFullMessage(
    type: string,
    scope: string | undefined,
    description: string,
    body?: string,
    footer?: string
  ): string {
    let message = type;

    if (scope) {
      message += `(${scope})`;
    }

    message += `: ${description}`;

    if (body) {
      message += `\n\n${body}`;
    }

    if (footer) {
      message += `\n\n${footer}`;
    }

    return message;
  }

  /**
   * Display generated commit message
   */
  displayCommitMessage(commitMessage: CommitMessage): void {
    console.log(chalk.blue("\n📝 Generated Commit Message:"));
    console.log(chalk.blue("=".repeat(40)));

    console.log(chalk.cyan(`Type: ${commitMessage.type}`));
    if (commitMessage.scope) {
      console.log(chalk.cyan(`Scope: ${commitMessage.scope}`));
    }
    console.log(chalk.white(`Description: ${commitMessage.description}`));

    if (commitMessage.body) {
      console.log(chalk.gray("\nBody:"));
      console.log(chalk.gray(commitMessage.body));
    }

    if (commitMessage.footer) {
      console.log(chalk.gray("\nFooter:"));
      console.log(chalk.gray(commitMessage.footer));
    }

    console.log(chalk.yellow("\nFull Message:"));
    console.log(chalk.white(commitMessage.fullMessage));
  }
}
