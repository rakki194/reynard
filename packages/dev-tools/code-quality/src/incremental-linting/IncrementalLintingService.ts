/**
 * 🦊 Reynard Incremental Linting Service
 * 
 * Consolidated incremental linting service that merges functionality
 * from the incremental-linting package into code-quality.
 */

import { EventEmitter } from "events";
import { spawn } from "child_process";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import chokidar from "chokidar";
import { ReynardLogger } from "reynard-dev-tools-catalyst";
import { LintingOrchestrator } from "reynard-dev-tools-catalyst";
import type { LintingConfig, LintingResult } from "reynard-dev-tools-catalyst";

export interface IncrementalLintingConfig {
  projectRoot?: string;
  watchPatterns?: string[];
  excludePatterns?: string[];
  processors?: {
    eslint?: { enabled: boolean; fix: boolean };
    prettier?: { enabled: boolean; fix: boolean };
    python?: { enabled: boolean; fix: boolean };
  };
  queue?: {
    maxConcurrency: number;
    batchSize: number;
    debounceMs: number;
  };
  cache?: {
    enabled: boolean;
    directory: string;
    ttl: number;
  };
}

export interface LintingProcessor {
  name: string;
  canProcess: (filePath: string) => boolean;
  lint: (filePath: string) => Promise<LintResult>;
  fix?: (filePath: string) => Promise<void>;
}

export interface LintResult {
  success: boolean;
  issues: LintIssue[];
  duration: number;
  cached: boolean;
}

export interface LintIssue {
  file: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  rule: string;
  source: string;
}

export interface LintingQueueStatus {
  isRunning: boolean;
  queueSize: number;
  processingCount: number;
  totalProcessed: number;
  totalErrors: number;
  totalWarnings: number;
  averageTime: number;
  lastProcessed?: string;
}

export interface LintingCacheEntry {
  filePath: string;
  hash: string;
  result: LintResult;
  timestamp: number;
  ttl: number;
}

export interface LintingStats {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  averageLintTime: number;
  totalLintTime: number;
  cacheHits: number;
  cacheMisses: number;
}

export class IncrementalLintingService extends EventEmitter {
  private logger: ReynardLogger;
  private projectRoot: string;
  private config: IncrementalLintingConfig;
  private watcher?: chokidar.FSWatcher;
  private processors: Map<string, LintingProcessor> = new Map();
  private queue: string[] = [];
  private processing: Set<string> = new Set();
  private cache: Map<string, LintingCacheEntry> = new Map();
  private stats: LintingStats = {
    totalFiles: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    averageLintTime: 0,
    totalLintTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  private isRunning: boolean = false;
  private debounceTimer?: NodeJS.Timeout;

  constructor(config: IncrementalLintingConfig = {}, logger?: ReynardLogger) {
    super();
    this.projectRoot = resolve(config.projectRoot || process.cwd());
    this.logger = logger || new ReynardLogger();
    this.config = this.mergeConfig(config);
    this.initializeProcessors();
  }

  /**
   * Start the incremental linting service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("⚠️  Incremental linting service is already running");
      return;
    }

    this.logger.info("🦊 Starting incremental linting service...");

    try {
      // Initialize cache directory
      if (this.config.cache?.enabled) {
        await this.initializeCache();
      }

      // Start file watcher
      await this.startWatcher();

      // Process initial files
      await this.processInitialFiles();

      this.isRunning = true;
      this.logger.success("✅ Incremental linting service started");
      this.emit("started");
    } catch (error) {
      this.logger.error(`❌ Failed to start incremental linting service: ${error}`);
      throw error;
    }
  }

  /**
   * Stop the incremental linting service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn("⚠️  Incremental linting service is not running");
      return;
    }

    this.logger.info("🦊 Stopping incremental linting service...");

    try {
      // Stop file watcher
      if (this.watcher) {
        await this.watcher.close();
        this.watcher = undefined;
      }

      // Clear debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = undefined;
      }

      // Wait for current processing to complete
      await this.waitForProcessingComplete();

      this.isRunning = false;
      this.logger.success("✅ Incremental linting service stopped");
      this.emit("stopped");
    } catch (error) {
      this.logger.error(`❌ Failed to stop incremental linting service: ${error}`);
      throw error;
    }
  }

  /**
   * Get current status
   */
  getStatus(): LintingQueueStatus {
    return {
      isRunning: this.isRunning,
      queueSize: this.queue.length,
      processingCount: this.processing.size,
      totalProcessed: this.stats.totalFiles,
      totalErrors: this.stats.totalIssues,
      totalWarnings: 0, // TODO: Track warnings separately
      averageTime: this.stats.averageLintTime,
      lastProcessed: this.queue[this.queue.length - 1]
    };
  }

  /**
   * Get linting statistics
   */
  getStats(): LintingStats {
    return { ...this.stats };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    if (this.config.cache?.enabled) {
      try {
        const { rm } = await import("fs/promises");
        await rm(this.config.cache.directory, { recursive: true, force: true });
        await this.initializeCache();
        this.logger.info("🧹 Cache cleared");
      } catch (error) {
        this.logger.warn(`⚠️  Failed to clear cache: ${error}`);
      }
    }
  }

  /**
   * Start file watcher
   */
  private async startWatcher(): Promise<void> {
    const patterns = this.config.watchPatterns || [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.py"
    ];

    const ignored = this.config.excludePatterns || [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/third_party/**",
      "**/.git/**"
    ];

    this.watcher = chokidar.watch(patterns, {
      cwd: this.projectRoot,
      ignored,
      ignoreInitial: true,
      persistent: true
    });

    this.watcher
      .on("add", (filePath) => this.handleFileChange(filePath, "add"))
      .on("change", (filePath) => this.handleFileChange(filePath, "change"))
      .on("unlink", (filePath) => this.handleFileChange(filePath, "unlink"))
      .on("error", (error) => {
        this.logger.error(`❌ File watcher error: ${error}`);
        this.emit("error", error);
      });

    this.logger.info(`👀 Watching files: ${patterns.join(", ")}`);
  }

  /**
   * Handle file changes
   */
  private handleFileChange(filePath: string, event: "add" | "change" | "unlink"): void {
    const fullPath = join(this.projectRoot, filePath);

    if (event === "unlink") {
      // Remove from cache and queue
      this.cache.delete(fullPath);
      this.queue = this.queue.filter(path => path !== fullPath);
      return;
    }

    // Debounce file changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.addToQueue(fullPath);
    }, this.config.queue?.debounceMs || 500);
  }

  /**
   * Add file to processing queue
   */
  private addToQueue(filePath: string): void {
    if (this.processing.has(filePath) || this.queue.includes(filePath)) {
      return;
    }

    this.queue.push(filePath);
    this.processQueue();
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    const maxConcurrency = this.config.queue?.maxConcurrency || 4;
    
    if (this.processing.size >= maxConcurrency || this.queue.length === 0) {
      return;
    }

    const batchSize = this.config.queue?.batchSize || 1;
    const batch = this.queue.splice(0, batchSize);

    for (const filePath of batch) {
      this.processing.add(filePath);
      this.processFile(filePath).finally(() => {
        this.processing.delete(filePath);
        this.processQueue(); // Process next batch
      });
    }
  }

  /**
   * Process a single file
   */
  private async processFile(filePath: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.config.cache?.enabled) {
        const cached = await this.getCachedResult(filePath);
        if (cached) {
          this.stats.cacheHits++;
          this.updateStats(cached, Date.now() - startTime);
          this.emit("fileProcessed", { filePath, result: cached, cached: true });
          return;
        }
        this.stats.cacheMisses++;
      }

      // Find appropriate processor
      const processor = this.getProcessorForFile(filePath);
      if (!processor) {
        this.logger.verbose(`⚠️  No processor found for ${filePath}`);
        return;
      }

      // Process file
      const result = await processor.lint(filePath);
      const duration = Date.now() - startTime;

      // Update cache
      if (this.config.cache?.enabled) {
        await this.setCachedResult(filePath, result);
      }

      // Update stats
      this.updateStats(result, duration);

      this.emit("fileProcessed", { filePath, result, cached: false });
    } catch (error) {
      this.logger.error(`❌ Failed to process ${filePath}: ${error}`);
      this.emit("error", { filePath, error });
    }
  }

  /**
   * Process initial files
   */
  private async processInitialFiles(): Promise<void> {
    const patterns = this.config.watchPatterns || ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"];
    const { glob } = await import("glob");

    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: this.projectRoot,
        ignore: this.config.excludePatterns,
        absolute: true
      });

      for (const file of files) {
        this.addToQueue(file);
      }
    }
  }

  /**
   * Get processor for file
   */
  private getProcessorForFile(filePath: string): LintingProcessor | undefined {
    for (const processor of this.processors.values()) {
      if (processor.canProcess(filePath)) {
        return processor;
      }
    }
    return undefined;
  }

  /**
   * Initialize processors
   */
  private initializeProcessors(): void {
    // ESLint processor
    this.processors.set("eslint", {
      name: "ESLint",
      canProcess: (filePath) => /\.(ts|tsx|js|jsx)$/.test(filePath),
      lint: async (filePath) => this.runESLint(filePath),
      fix: async (filePath) => this.fixESLint(filePath)
    });

    // Prettier processor
    this.processors.set("prettier", {
      name: "Prettier",
      canProcess: (filePath) => /\.(ts|tsx|js|jsx|json|md|css|scss)$/.test(filePath),
      lint: async (filePath) => this.runPrettier(filePath),
      fix: async (filePath) => this.fixPrettier(filePath)
    });

    // Python processor
    this.processors.set("python", {
      name: "Python",
      canProcess: (filePath) => /\.py$/.test(filePath),
      lint: async (filePath) => this.runPythonLinting(filePath),
      fix: async (filePath) => this.fixPythonLinting(filePath)
    });
  }

  /**
   * Run ESLint on file
   */
  private async runESLint(filePath: string): Promise<LintResult> {
    const startTime = Date.now();
    const issues: LintIssue[] = [];

    try {
      const { execSync } = await import("child_process");
      const result = execSync(`npx eslint "${filePath}" --format json`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      const eslintResults = JSON.parse(result);
      for (const result of eslintResults) {
        for (const message of result.messages) {
          issues.push({
            file: result.filePath,
            line: message.line,
            column: message.column,
            severity: this.mapESLintSeverity(message.severity),
            message: message.message,
            rule: message.ruleId || "unknown",
            source: "eslint"
          });
        }
      }
    } catch (error: any) {
      if (error.stdout) {
        try {
          const eslintResults = JSON.parse(error.stdout);
          for (const result of eslintResults) {
            for (const message of result.messages) {
              issues.push({
                file: result.filePath,
                line: message.line,
                column: message.column,
                severity: this.mapESLintSeverity(message.severity),
                message: message.message,
                rule: message.ruleId || "unknown",
                source: "eslint"
              });
            }
          }
        } catch (parseError) {
          issues.push({
            file: filePath,
            line: 0,
            column: 0,
            severity: "error",
            message: "ESLint failed to parse file",
            rule: "eslint-error",
            source: "eslint"
          });
        }
      }
    }

    return {
      success: issues.filter(i => i.severity === "error").length === 0,
      issues,
      duration: Date.now() - startTime,
      cached: false
    };
  }

  /**
   * Fix ESLint issues
   */
  private async fixESLint(filePath: string): Promise<void> {
    try {
      const { execSync } = await import("child_process");
      execSync(`npx eslint "${filePath}" --fix`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error) {
      this.logger.warn(`⚠️  ESLint fix completed with remaining issues for ${filePath}`);
    }
  }

  /**
   * Run Prettier on file
   */
  private async runPrettier(filePath: string): Promise<LintResult> {
    const startTime = Date.now();
    const issues: LintIssue[] = [];

    try {
      const { execSync } = await import("child_process");
      execSync(`npx prettier --check "${filePath}"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error: any) {
      issues.push({
        file: filePath,
        line: 0,
        column: 0,
        severity: "warning",
        message: "File is not formatted according to Prettier rules",
        rule: "prettier/prettier",
        source: "prettier"
      });
    }

    return {
      success: issues.length === 0,
      issues,
      duration: Date.now() - startTime,
      cached: false
    };
  }

  /**
   * Fix Prettier issues
   */
  private async fixPrettier(filePath: string): Promise<void> {
    try {
      const { execSync } = await import("child_process");
      execSync(`npx prettier --write "${filePath}"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error) {
      this.logger.error(`❌ Failed to fix Prettier issues for ${filePath}: ${error}`);
    }
  }

  /**
   * Run Python linting
   */
  private async runPythonLinting(filePath: string): Promise<LintResult> {
    const startTime = Date.now();
    const issues: LintIssue[] = [];

    try {
      const { execSync } = await import("child_process");
      execSync(`bash -c "source ~/venv/bin/activate && flake8 '${filePath}'"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error: any) {
      const lines = error.stdout?.split("\n") || [];
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(":");
          if (parts.length >= 4) {
            issues.push({
              file: parts[0],
              line: parseInt(parts[1]) || 0,
              column: parseInt(parts[2]) || 0,
              severity: "warning",
              message: parts.slice(3).join(":").trim(),
              rule: "flake8",
              source: "flake8"
            });
          }
        }
      }
    }

    return {
      success: issues.length === 0,
      issues,
      duration: Date.now() - startTime,
      cached: false
    };
  }

  /**
   * Fix Python linting issues
   */
  private async fixPythonLinting(filePath: string): Promise<void> {
    try {
      const { execSync } = await import("child_process");
      
      // Run black for formatting
      execSync(`bash -c "source ~/venv/bin/activate && black '${filePath}'"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      // Run isort for import sorting
      execSync(`bash -c "source ~/venv/bin/activate && isort '${filePath}'"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error) {
      this.logger.error(`❌ Failed to fix Python linting issues for ${filePath}: ${error}`);
    }
  }

  /**
   * Map ESLint severity to our severity type
   */
  private mapESLintSeverity(severity: number): "error" | "warning" | "info" {
    switch (severity) {
      case 2: return "error";
      case 1: return "warning";
      default: return "info";
    }
  }

  /**
   * Get cached result
   */
  private async getCachedResult(filePath: string): Promise<LintResult | null> {
    if (!this.config.cache?.enabled) {
      return null;
    }

    try {
      const stats = await import("fs/promises").then(fs => fs.stat(filePath));
      const hash = `${stats.mtime.getTime()}-${stats.size}`;
      
      const cached = this.cache.get(filePath);
      if (cached && cached.hash === hash && Date.now() - cached.timestamp < cached.ttl) {
        return cached.result;
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }

    return null;
  }

  /**
   * Set cached result
   */
  private async setCachedResult(filePath: string, result: LintResult): Promise<void> {
    if (!this.config.cache?.enabled) {
      return;
    }

    try {
      const stats = await import("fs/promises").then(fs => fs.stat(filePath));
      const hash = `${stats.mtime.getTime()}-${stats.size}`;
      
      const entry: LintingCacheEntry = {
        filePath,
        hash,
        result,
        timestamp: Date.now(),
        ttl: this.config.cache?.ttl || 300000 // 5 minutes default
      };

      this.cache.set(filePath, entry);
    } catch (error) {
      // File doesn't exist or can't be read
    }
  }

  /**
   * Update statistics
   */
  private updateStats(result: LintResult, duration: number): void {
    this.stats.totalFiles++;
    this.stats.totalLintTime += duration;
    this.stats.averageLintTime = this.stats.totalLintTime / this.stats.totalFiles;

    if (result.issues.length > 0) {
      this.stats.filesWithIssues++;
      this.stats.totalIssues += result.issues.length;
    }
  }

  /**
   * Initialize cache directory
   */
  private async initializeCache(): Promise<void> {
    if (!this.config.cache?.enabled) {
      return;
    }

    try {
      await mkdir(this.config.cache.directory, { recursive: true });
    } catch (error) {
      this.logger.warn(`⚠️  Failed to create cache directory: ${error}`);
    }
  }

  /**
   * Wait for processing to complete
   */
  private async waitForProcessingComplete(): Promise<void> {
    while (this.processing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config: IncrementalLintingConfig): IncrementalLintingConfig {
    const defaultConfig: IncrementalLintingConfig = {
      projectRoot: process.cwd(),
      watchPatterns: [
        "**/*.ts",
        "**/*.tsx",
        "**/*.js",
        "**/*.jsx",
        "**/*.py"
      ],
      excludePatterns: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "**/third_party/**",
        "**/.git/**"
      ],
      processors: {
        eslint: { enabled: true, fix: true },
        prettier: { enabled: true, fix: true },
        python: { enabled: true, fix: true }
      },
      queue: {
        maxConcurrency: 4,
        batchSize: 1,
        debounceMs: 500
      },
      cache: {
        enabled: true,
        directory: join(process.cwd(), ".cache", "incremental-linting"),
        ttl: 300000 // 5 minutes
      }
    };

    return {
      ...defaultConfig,
      ...config,
      processors: {
        ...defaultConfig.processors,
        ...config.processors
      },
      queue: {
        ...defaultConfig.queue,
        ...config.queue
      },
      cache: {
        ...defaultConfig.cache,
        ...config.cache
      }
    };
  }
}
