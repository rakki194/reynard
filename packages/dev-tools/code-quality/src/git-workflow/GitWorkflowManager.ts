/**
 * 🦊 Reynard Git Workflow Manager
 * 
 * Consolidated git workflow management that merges functionality
 * from the git-automation package into code-quality.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
// TODO: Import from catalyst once build issues are resolved
// import { ReynardLogger } from "reynard-dev-tools-catalyst";
// import { JunkFileDetector } from "reynard-dev-tools-catalyst";
// import type { JunkDetectionResult } from "reynard-dev-tools-catalyst";

// Temporary simple logger implementation
class SimpleLogger {
  info(msg: string) { console.log(`[INFO] ${msg}`); }
  warn(msg: string) { console.warn(`[WARN] ${msg}`); }
  error(msg: string) { console.error(`[ERROR] ${msg}`); }
  success(msg: string) { console.log(`[SUCCESS] ${msg}`); }
  section(msg: string) { console.log(`\n=== ${msg} ===`); }
}

// Temporary simple junk detector implementation
class SimpleJunkDetector {
  async detectJunkFiles() {
    return { hasJunk: false, totalFiles: 0, totalSize: 0, categories: {} };
  }
  async cleanJunkFiles() {
    return { deleted: 0, freedSpace: 0 };
  }
}

export interface GitWorkflowOptions {
  workingDir?: string;
  cleanup?: boolean;
  analyze?: boolean;
  generateCommit?: boolean;
  updateChangelog?: boolean;
  updateVersion?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface ChangeAnalysis {
  addedFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
  stagedFiles: string[];
  unstagedFiles: string[];
  untrackedFiles: string[];
  summary: {
    totalChanges: number;
    addedCount: number;
    modifiedCount: number;
    deletedCount: number;
  };
}

export interface CommitMessage {
  type: string;
  scope?: string;
  description: string;
  body?: string;
  footer?: string;
  breaking?: boolean;
  fullMessage: string;
}

export interface VersionInfo {
  current: string;
  next: string;
  type: "major" | "minor" | "patch";
  prerelease?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added: string[];
    changed: string[];
    fixed: string[];
    removed: string[];
    security: string[];
  };
}

export class GitWorkflowManager {
  private logger: SimpleLogger;
  private projectRoot: string;
  private junkDetector: SimpleJunkDetector;

  constructor(projectRoot: string = process.cwd(), logger?: SimpleLogger) {
    this.projectRoot = resolve(projectRoot);
    this.logger = logger || new SimpleLogger();
    this.junkDetector = new SimpleJunkDetector();
  }

  /**
   * Execute complete Git workflow
   */
  async executeWorkflow(options: GitWorkflowOptions = {}): Promise<void> {
    this.logger.info("🦊 Executing Git workflow...");

    try {
      const workingDir = options.workingDir || this.projectRoot;

      // Step 1: Detect and clean junk files
      if (options.cleanup) {
        await this.cleanupJunkFiles(workingDir, options.dryRun);
      }

      // Step 2: Analyze changes
      if (options.analyze) {
        const changes = await this.analyzeChanges(workingDir);
        this.logChangeAnalysis(changes);
      }

      // Step 3: Generate commit message
      if (options.generateCommit) {
        const commitMessage = await this.generateCommitMessage(workingDir);
        this.logger.info(`📝 Generated commit message: ${commitMessage.fullMessage}`);
      }

      // Step 4: Update changelog
      if (options.updateChangelog) {
        await this.updateChangelog(workingDir, options.dryRun);
      }

      // Step 5: Update version
      if (options.updateVersion) {
        const versionInfo = await this.updateVersion(workingDir, options.dryRun);
        this.logger.info(`📦 Version updated: ${versionInfo.current} → ${versionInfo.next}`);
      }

      this.logger.success("✅ Git workflow completed successfully");
    } catch (error) {
      this.logger.error(`❌ Git workflow failed: ${error}`);
      throw error;
    }
  }

  /**
   * Clean up junk files
   */
  private async cleanupJunkFiles(_workingDir: string, dryRun: boolean = false): Promise<void> {
    this.logger.info("🧹 Detecting junk files...");

    const result = await this.junkDetector.detectJunkFiles();
    
    if (!result.hasJunk) {
      this.logger.info("✅ No junk files found");
      return;
    }

    this.logger.warn(`⚠️  Found ${result.totalFiles} junk files (${this.formatBytes(result.totalSize)})`);

    if (dryRun) {
      this.logger.info("🧹 Dry run: Would clean junk files");
      for (const [category, data] of Object.entries(result.categories)) {
        this.logger.info(`  ${category}: ${(data as any).count} files`);
      }
    } else {
      const cleanResult = await this.junkDetector.cleanJunkFiles();
      this.logger.success(`🧹 Cleaned ${cleanResult.deleted} files, freed ${this.formatBytes(cleanResult.freedSpace)}`);
    }
  }

  /**
   * Analyze git changes
   */
  private async analyzeChanges(workingDir: string): Promise<ChangeAnalysis> {
    this.logger.info("🔍 Analyzing git changes...");

    try {
      // Get git status
      const statusOutput = execSync("git status --porcelain", {
        cwd: workingDir,
        encoding: "utf8"
      });

      const lines = statusOutput.trim().split("\n").filter(line => line.length > 0);
      
      const addedFiles: string[] = [];
      const modifiedFiles: string[] = [];
      const deletedFiles: string[] = [];
      const stagedFiles: string[] = [];
      const unstagedFiles: string[] = [];
      const untrackedFiles: string[] = [];

      for (const line of lines) {
        const status = line.substring(0, 2);
        const filePath = line.substring(3);

        if (status.includes("A")) {
          addedFiles.push(filePath);
          stagedFiles.push(filePath);
        } else if (status.includes("M")) {
          modifiedFiles.push(filePath);
          if (status.startsWith("M")) {
            stagedFiles.push(filePath);
          } else {
            unstagedFiles.push(filePath);
          }
        } else if (status.includes("D")) {
          deletedFiles.push(filePath);
          if (status.startsWith("D")) {
            stagedFiles.push(filePath);
          } else {
            unstagedFiles.push(filePath);
          }
        } else if (status.includes("??")) {
          untrackedFiles.push(filePath);
        }
      }

      return {
        addedFiles,
        modifiedFiles,
        deletedFiles,
        stagedFiles,
        unstagedFiles,
        untrackedFiles,
        summary: {
          totalChanges: addedFiles.length + modifiedFiles.length + deletedFiles.length,
          addedCount: addedFiles.length,
          modifiedCount: modifiedFiles.length,
          deletedCount: deletedFiles.length
        }
      };
    } catch (error) {
      this.logger.error(`❌ Failed to analyze changes: ${error}`);
      throw error;
    }
  }

  /**
   * Generate commit message
   */
  private async generateCommitMessage(workingDir: string): Promise<CommitMessage> {
    this.logger.info("📝 Generating commit message...");

    try {
      const changes = await this.analyzeChanges(workingDir);
      
      // Determine commit type based on changes
      let type = "chore";
      let scope = "";
      let description = "";

      if (changes.addedFiles.length > 0) {
        type = "feat";
        description = "Add new features";
      } else if (changes.modifiedFiles.length > 0) {
        type = "fix";
        description = "Fix issues";
      } else if (changes.deletedFiles.length > 0) {
        type = "refactor";
        description = "Remove unused code";
      }

      // Try to determine scope from file paths
      const commonPath = this.findCommonPath([...changes.addedFiles, ...changes.modifiedFiles]);
      if (commonPath) {
        scope = commonPath.split("/")[0] || "";
      }

      const fullMessage = `${type}${scope ? `(${scope})` : ""}: ${description}`;

      return {
        type,
        scope,
        description,
        fullMessage
      };
    } catch (error) {
      this.logger.error(`❌ Failed to generate commit message: ${error}`);
      throw error;
    }
  }

  /**
   * Update changelog
   */
  private async updateChangelog(workingDir: string, dryRun: boolean = false): Promise<void> {
    this.logger.info("📋 Updating changelog...");

    const changelogPath = join(workingDir, "CHANGELOG.md");
    
    if (!existsSync(changelogPath)) {
      this.logger.warn("⚠️  No CHANGELOG.md found, skipping changelog update");
      return;
    }

    try {
      const changes = await this.analyzeChanges(workingDir);
      const versionInfo = await this.getCurrentVersion(workingDir);
      
      const entry: ChangelogEntry = {
        version: versionInfo.next,
        date: new Date().toISOString().split("T")[0],
        changes: {
          added: changes.addedFiles,
          changed: changes.modifiedFiles,
          fixed: [],
          removed: changes.deletedFiles,
          security: []
        }
      };

      if (dryRun) {
        this.logger.info("📋 Dry run: Would update changelog");
        this.logger.info(`  Version: ${entry.version}`);
        this.logger.info(`  Date: ${entry.date}`);
        this.logger.info(`  Changes: ${entry.changes.added.length} added, ${entry.changes.changed.length} changed, ${entry.changes.removed.length} removed`);
      } else {
        const changelogContent = readFileSync(changelogPath, "utf8");
        const newEntry = this.formatChangelogEntry(entry);
        const updatedContent = this.insertChangelogEntry(changelogContent, newEntry);
        writeFileSync(changelogPath, updatedContent);
        this.logger.success("📋 Changelog updated");
      }
    } catch (error) {
      this.logger.error(`❌ Failed to update changelog: ${error}`);
      throw error;
    }
  }

  /**
   * Update version
   */
  private async updateVersion(workingDir: string, dryRun: boolean = false): Promise<VersionInfo> {
    this.logger.info("📦 Updating version...");

    const packageJsonPath = join(workingDir, "package.json");
    
    if (!existsSync(packageJsonPath)) {
      this.logger.warn("⚠️  No package.json found, skipping version update");
      throw new Error("No package.json found");
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      const currentVersion = packageJson.version || "0.0.0";
      
      // Determine version bump type based on changes
      const changes = await this.analyzeChanges(workingDir);
      let versionType: "major" | "minor" | "patch" = "patch";
      
      if (changes.addedFiles.some(file => file.includes("BREAKING") || file.includes("breaking"))) {
        versionType = "major";
      } else if (changes.addedFiles.length > 0) {
        versionType = "minor";
      }

      const nextVersion = this.bumpVersion(currentVersion, versionType);

      if (dryRun) {
        this.logger.info("📦 Dry run: Would update version");
        this.logger.info(`  Current: ${currentVersion}`);
        this.logger.info(`  Next: ${nextVersion} (${versionType})`);
      } else {
        packageJson.version = nextVersion;
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
        this.logger.success(`📦 Version updated: ${currentVersion} → ${nextVersion}`);
      }

      return {
        current: currentVersion,
        next: nextVersion,
        type: versionType
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update version: ${error}`);
      throw error;
    }
  }

  /**
   * Get current version from package.json
   */
  private async getCurrentVersion(workingDir: string): Promise<VersionInfo> {
    const packageJsonPath = join(workingDir, "package.json");
    
    if (!existsSync(packageJsonPath)) {
      return { current: "0.0.0", next: "0.0.1", type: "patch" };
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      const currentVersion = packageJson.version || "0.0.0";
      const nextVersion = this.bumpVersion(currentVersion, "patch");
      
      return {
        current: currentVersion,
        next: nextVersion,
        type: "patch"
      };
    } catch (error) {
      return { current: "0.0.0", next: "0.0.1", type: "patch" };
    }
  }

  /**
   * Bump version number
   */
  private bumpVersion(version: string, type: "major" | "minor" | "patch"): string {
    const parts = version.split(".").map(Number);
    
    switch (type) {
      case "major":
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case "minor":
        parts[1]++;
        parts[2] = 0;
        break;
      case "patch":
        parts[2]++;
        break;
    }
    
    return parts.join(".");
  }

  /**
   * Find common path prefix
   */
  private findCommonPath(files: string[]): string | null {
    if (files.length === 0) return null;
    
    const parts = files[0].split("/");
    let commonLength = parts.length;
    
    for (let i = 1; i < files.length; i++) {
      const fileParts = files[i].split("/");
      let j = 0;
      
      while (j < commonLength && j < fileParts.length && parts[j] === fileParts[j]) {
        j++;
      }
      
      commonLength = j;
    }
    
    return commonLength > 0 ? parts.slice(0, commonLength).join("/") : null;
  }

  /**
   * Format changelog entry
   */
  private formatChangelogEntry(entry: ChangelogEntry): string {
    let content = `## [${entry.version}] - ${entry.date}\n\n`;
    
    if (entry.changes.added.length > 0) {
      content += "### Added\n";
      for (const item of entry.changes.added) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }
    
    if (entry.changes.changed.length > 0) {
      content += "### Changed\n";
      for (const item of entry.changes.changed) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }
    
    if (entry.changes.fixed.length > 0) {
      content += "### Fixed\n";
      for (const item of entry.changes.fixed) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }
    
    if (entry.changes.removed.length > 0) {
      content += "### Removed\n";
      for (const item of entry.changes.removed) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }
    
    if (entry.changes.security.length > 0) {
      content += "### Security\n";
      for (const item of entry.changes.security) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }
    
    return content;
  }

  /**
   * Insert changelog entry
   */
  private insertChangelogEntry(content: string, entry: string): string {
    const lines = content.split("\n");
    let insertIndex = 0;
    
    // Find the first heading (after title)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("## ")) {
        insertIndex = i;
        break;
      }
    }
    
    lines.splice(insertIndex, 0, entry);
    return lines.join("\n");
  }

  /**
   * Log change analysis
   */
  private logChangeAnalysis(changes: ChangeAnalysis): void {
    this.logger.info("📊 Change Analysis:");
    this.logger.info(`  Total changes: ${changes.summary.totalChanges}`);
    this.logger.info(`  Added: ${changes.summary.addedCount} files`);
    this.logger.info(`  Modified: ${changes.summary.modifiedCount} files`);
    this.logger.info(`  Deleted: ${changes.summary.deletedCount} files`);
    this.logger.info(`  Staged: ${changes.stagedFiles.length} files`);
    this.logger.info(`  Unstaged: ${changes.unstagedFiles.length} files`);
    this.logger.info(`  Untracked: ${changes.untrackedFiles.length} files`);
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
