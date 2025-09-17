/**
 * 🦊 MCP Git Automation Tools
 * 
 * MCP (Model Context Protocol) integration for Git automation tools.
 * Provides programmatic access to all Git workflow components.
 */

import {
  JunkFileDetector,
  ChangeAnalyzer,
  CommitMessageGenerator,
  ChangelogManager,
  VersionManager,
  GitWorkflowOrchestrator,
  type JunkDetectionResult,
  type ChangeAnalysisResult,
  type CommitMessage,
  type VersionInfo,
  type WorkflowResult
} from './index.js';

export class MCPGitAutomationTools {
  private readonly workingDir: string;

  constructor(workingDir: string = '.') {
    this.workingDir = workingDir;
  }

  /**
   * Detect junk files in the repository
   */
  async detectJunkFiles(): Promise<JunkDetectionResult> {
    const detector = new JunkFileDetector();
    return await detector.detectJunkFiles();
  }

  /**
   * Analyze Git changes
   */
  async analyzeChanges(): Promise<ChangeAnalysisResult> {
    const analyzer = new ChangeAnalyzer();
    return await analyzer.analyzeChanges(this.workingDir);
  }

  /**
   * Generate commit message from changes
   */
  async generateCommitMessage(): Promise<CommitMessage> {
    const analyzer = new ChangeAnalyzer();
    const generator = new CommitMessageGenerator();
    
    const analysis = await analyzer.analyzeChanges(this.workingDir);
    return generator.generateCommitMessage(analysis);
  }

  /**
   * Get current version
   */
  async getCurrentVersion(): Promise<string> {
    const manager = new VersionManager(this.workingDir);
    return await manager.getCurrentVersion();
  }

  /**
   * Calculate next version
   */
  calculateNextVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch'): string {
    const manager = new VersionManager(this.workingDir);
    return manager.calculateNextVersion(currentVersion, bumpType);
  }

  /**
   * Update package version
   */
  async updateVersion(newVersion: string): Promise<void> {
    const manager = new VersionManager(this.workingDir);
    return await manager.updateVersion(newVersion);
  }

  /**
   * Create Git tag
   */
  async createGitTag(version: string, message?: string): Promise<void> {
    const manager = new VersionManager(this.workingDir);
    return await manager.createGitTag(version, message);
  }

  /**
   * Push Git tag to remote
   */
  async pushGitTag(version: string): Promise<void> {
    const manager = new VersionManager(this.workingDir);
    return await manager.pushGitTag(version);
  }

  /**
   * Promote unreleased changes to versioned release
   */
  async promoteUnreleasedToRelease(version: string, date?: string): Promise<void> {
    const manager = new ChangelogManager(this.workingDir);
    const releaseDate = date || manager.getCurrentDate();
    return await manager.promoteUnreleasedToRelease(version, releaseDate);
  }

  /**
   * Validate changelog structure
   */
  async validateChangelog(): Promise<{ valid: boolean; issues: string[] }> {
    const manager = new ChangelogManager(this.workingDir);
    return await manager.validateChangelog();
  }

  /**
   * Execute complete workflow
   */
  async executeWorkflow(options: {
    skipJunkDetection?: boolean;
    skipChangeAnalysis?: boolean;
    skipCommitGeneration?: boolean;
    skipVersionBump?: boolean;
    skipChangelogUpdate?: boolean;
    skipGitTag?: boolean;
    dryRun?: boolean;
    autoConfirm?: boolean;
    commitMessage?: string;
    versionBumpType?: 'major' | 'minor' | 'patch';
  } = {}): Promise<WorkflowResult> {
    const orchestrator = new GitWorkflowOrchestrator(this.workingDir);
    return await orchestrator.executeWorkflow(options);
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(): Promise<{
    hasChanges: boolean;
    hasStagedChanges: boolean;
    currentVersion: string;
    latestTag: string | null;
    changelogValid: boolean;
  }> {
    const analyzer = new ChangeAnalyzer();
    const versionManager = new VersionManager(this.workingDir);
    const changelogManager = new ChangelogManager(this.workingDir);

    try {
      const analysis = await analyzer.analyzeChanges(this.workingDir);
      const currentVersion = await versionManager.getCurrentVersion();
      const latestTag = await versionManager.getLatestGitTag();
      const changelogValidation = await changelogManager.validateChangelog();

      return {
        hasChanges: analysis.totalFiles > 0,
        hasStagedChanges: analysis.totalFiles > 0, // Simplified check
        currentVersion,
        latestTag,
        changelogValid: changelogValidation.valid
      };
    } catch (error) {
      throw new Error(`Failed to get workflow status: ${error}`);
    }
  }

  /**
   * Get monorepo package versions
   */
  async getMonorepoVersions(): Promise<Array<{
    name: string;
    currentVersion: string;
    nextVersion: string;
    bumpType: 'major' | 'minor' | 'patch';
    path: string;
  }>> {
    const manager = new VersionManager(this.workingDir);
    return await manager.getMonorepoVersions();
  }

  /**
   * Generate release notes
   */
  async generateReleaseNotes(version: string, changelogPath?: string): Promise<string> {
    const manager = new VersionManager(this.workingDir);
    return await manager.generateReleaseNotes(version, changelogPath);
  }

  /**
   * Check if Git tag exists
   */
  async gitTagExists(version: string): Promise<boolean> {
    const manager = new VersionManager(this.workingDir);
    return await manager.gitTagExists(version);
  }

  /**
   * Get all Git tags
   */
  async getGitTags(): Promise<string[]> {
    const manager = new VersionManager(this.workingDir);
    return await manager.getGitTags();
  }

  /**
   * Delete Git tag
   */
  async deleteGitTag(version: string): Promise<void> {
    const manager = new VersionManager(this.workingDir);
    return await manager.deleteGitTag(version);
  }

  /**
   * Add entry to unreleased changelog
   */
  async addUnreleasedEntry(type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security', description: string): Promise<void> {
    const manager = new ChangelogManager(this.workingDir);
    return await manager.addUnreleasedEntry(type, description);
  }

  /**
   * Read changelog structure
   */
  async readChangelog(): Promise<{
    header: string;
    unreleased: Array<{
      type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
      description: string;
    }>;
    releases: Array<{
      version: string;
      date: string;
      entries: Array<{
        type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
        description: string;
      }>;
    }>;
  }> {
    const manager = new ChangelogManager(this.workingDir);
    return await manager.readChangelog();
  }

  /**
   * Validate version format
   */
  validateVersion(version: string): boolean {
    const manager = new VersionManager(this.workingDir);
    return manager.validateVersion(version);
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: string, version2: string): number {
    const manager = new VersionManager(this.workingDir);
    return manager.compareVersions(version1, version2);
  }

  /**
   * Get version bump type between two versions
   */
  getBumpType(fromVersion: string, toVersion: string): 'major' | 'minor' | 'patch' | null {
    const manager = new VersionManager(this.workingDir);
    return manager.getBumpType(fromVersion, toVersion);
  }
}

// Export the tools class for MCP integration
export default MCPGitAutomationTools;
