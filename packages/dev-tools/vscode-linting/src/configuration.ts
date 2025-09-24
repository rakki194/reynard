/**
 * 🦊 Reynard VS Code Configuration
 * ================================
 *
 * Configuration management for the VS Code extension.
 */

import * as vscode from "vscode";
// Mock type for testing
interface IncrementalLintingConfig {
  rootPath: string;
  linters: any[];
  includePatterns: string[];
  excludePatterns: string[];
  debounceDelay: number;
  maxConcurrency: number;
  incremental: boolean;
  persistCache: boolean;
  cacheDir?: string;
  maxCacheAge?: number;
  autoFix?: boolean;
  lintOnSave: boolean;
  lintOnChange: boolean;
  outputFormat?: string;
  verbose: boolean;
}

/**
 * VS Code configuration manager
 */
export class LintingConfiguration {
  // private _context: vscode.ExtensionContext; // Not used
  private config: vscode.WorkspaceConfiguration;

  constructor(_context: vscode.ExtensionContext) {
    // this._context = _context; // Not used
    this.config = vscode.workspace.getConfiguration("reynard-linting");
  }

  /**
   * Load configuration from VS Code settings
   */
  async loadConfiguration(): Promise<IncrementalLintingConfig> {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      throw new Error("No workspace folder found");
    }

    // Get configuration from VS Code settings
    const config: IncrementalLintingConfig = {
      rootPath: workspaceRoot,
      linters: this.config.get("linters", []),
      includePatterns: this.config.get("includePatterns", [
        "packages/**/*",
        "backend/**/*",
        "services/**/*",
        "examples/**/*",
        "templates/**/*",
        "docs/**/*",
        "scripts/**/*",
      ]),
      excludePatterns: this.config.get("excludePatterns", [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "**/htmlcov/**",
        "**/__pycache__/**",
        "**/.pytest_cache/**",
        "**/.mypy_cache/**",
        "**/venv/**",
        "**/.venv/**",
        "**/third_party/**",
        "**/.git/**",
        "**/logs/**",
        "**/tmp/**",
        "**/temp/**",
      ]),
      debounceDelay: this.config.get("debounceDelay", 1000),
      maxConcurrency: this.config.get("maxConcurrency", 4),
      incremental: this.config.get("incremental", true),
      cacheDir: this.config.get("cacheDir", undefined),
      persistCache: this.config.get("persistCache", true),
      maxCacheAge: this.config.get("maxCacheAge", 24 * 60 * 60 * 1000),
      autoFix: this.config.get("autoFix", false),
      lintOnSave: this.config.get("lintOnSave", true),
      lintOnChange: this.config.get("lintOnChange", false),
      outputFormat: this.config.get("outputFormat", "vscode"),
      verbose: this.config.get("verbose", false),
    };

    return config;
  }

  /**
   * Check if linting should run on save
   */
  shouldLintOnSave(): boolean {
    return this.config.get("lintOnSave", true);
  }

  /**
   * Check if linting should run on change
   */
  shouldLintOnChange(): boolean {
    return this.config.get("lintOnChange", false);
  }

  /**
   * Get max concurrency setting
   */
  getMaxConcurrency(): number {
    return this.config.get("maxConcurrency", 4);
  }

  /**
   * Get debounce delay
   */
  getDebounceDelay(): number {
    return this.config.get("debounceDelay", 1000);
  }

  /**
   * Show configuration in VS Code
   */
  showConfiguration(): void {
    vscode.commands.executeCommand("workbench.action.openSettings", "reynard-linting");
  }

  /**
   * Update a configuration value
   */
  async updateConfiguration(key: string, value: any): Promise<void> {
    await this.config.update(key, value, vscode.ConfigurationTarget.Workspace);
  }

  /**
   * Get all configuration values
   */
  getAllConfiguration(): Record<string, any> {
    return {
      linters: this.config.get("linters", []),
      includePatterns: this.config.get("includePatterns", []),
      excludePatterns: this.config.get("excludePatterns", []),
      debounceDelay: this.config.get("debounceDelay", 1000),
      maxConcurrency: this.config.get("maxConcurrency", 4),
      incremental: this.config.get("incremental", true),
      cacheDir: this.config.get("cacheDir", undefined),
      persistCache: this.config.get("persistCache", true),
      maxCacheAge: this.config.get("maxCacheAge", 24 * 60 * 60 * 1000),
      autoFix: this.config.get("autoFix", false),
      lintOnSave: this.config.get("lintOnSave", true),
      lintOnChange: this.config.get("lintOnChange", false),
      outputFormat: this.config.get("outputFormat", "vscode"),
      verbose: this.config.get("verbose", false),
    };
  }
}