/**
 * 🦊 Reynard Junk File Detector
 * 
 * Consolidated junk file detection that combines functionality
 * from code-quality, git-automation, and queue-watcher packages.
 */

import { existsSync } from "fs";
import { stat } from "fs/promises";
import { join, resolve } from "path";
import { ReynardLogger } from "../logger/ReynardLogger.js";

export interface JunkDetectionResult {
  hasJunk: boolean;
  totalFiles: number;
  totalSize: number;
  categories: {
    [category: string]: {
      files: JunkFileResult[];
      count: number;
      size: number;
    };
  };
  summary: {
    buildArtifacts: number;
    cacheFiles: number;
    temporaryFiles: number;
    logFiles: number;
    lockFiles: number;
    other: number;
  };
}

export interface JunkFileResult {
  path: string;
  category: string;
  reason: string;
  size: number;
  lastModified: Date;
  canDelete: boolean;
  suggestion?: string;
}

export interface JunkPatterns {
  buildArtifacts: string[];
  cacheFiles: string[];
  temporaryFiles: string[];
  logFiles: string[];
  lockFiles: string[];
  other: string[];
}

export class JunkFileDetector {
  private logger: ReynardLogger;
  private projectRoot: string;
  private patterns: JunkPatterns;

  constructor(projectRoot: string = process.cwd(), logger?: ReynardLogger) {
    this.projectRoot = resolve(projectRoot);
    this.logger = logger || new ReynardLogger();
    this.patterns = this.initializePatterns();
  }

  /**
   * Detect junk files in the project
   */
  async detectJunkFiles(): Promise<JunkDetectionResult> {
    this.logger.info("🦊 Scanning for junk files...");

    const result: JunkDetectionResult = {
      hasJunk: false,
      totalFiles: 0,
      totalSize: 0,
      categories: {},
      summary: {
        buildArtifacts: 0,
        cacheFiles: 0,
        temporaryFiles: 0,
        logFiles: 0,
        lockFiles: 0,
        other: 0
      }
    };

    try {
      // Scan each category
      for (const [category, patterns] of Object.entries(this.patterns)) {
        const categoryFiles = await this.scanCategory(category, patterns);
        
        if (categoryFiles.length > 0) {
          result.hasJunk = true;
          result.categories[category] = {
            files: categoryFiles,
            count: categoryFiles.length,
            size: categoryFiles.reduce((sum, file) => sum + file.size, 0)
          };

          result.totalFiles += categoryFiles.length;
          result.totalSize += result.categories[category].size;
          result.summary[category as keyof typeof result.summary] = categoryFiles.length;
        }
      }

      this.logJunkDetectionResults(result);
      return result;
    } catch (error) {
      this.logger.error(`❌ Junk file detection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Clean junk files (with confirmation)
   */
  async cleanJunkFiles(dryRun: boolean = true): Promise<{
    deleted: number;
    freedSpace: number;
    errors: string[];
  }> {
    const detection = await this.detectJunkFiles();
    
    if (!detection.hasJunk) {
      this.logger.info("✅ No junk files found");
      return { deleted: 0, freedSpace: 0, errors: [] };
    }

    const result = { deleted: 0, freedSpace: 0, errors: [] as string[] };

    for (const [category, categoryData] of Object.entries(detection.categories)) {
      for (const file of categoryData.files) {
        if (file.canDelete) {
          try {
            if (!dryRun) {
              const { unlink } = await import("fs/promises");
              await unlink(file.path);
              this.logger.info(`🗑️  Deleted: ${file.path}`);
            } else {
              this.logger.info(`🗑️  Would delete: ${file.path} (${this.formatBytes(file.size)})`);
            }
            
            result.deleted++;
            result.freedSpace += file.size;
          } catch (error) {
            const errorMsg = `Failed to delete ${file.path}: ${error}`;
            result.errors.push(errorMsg);
            this.logger.error(`❌ ${errorMsg}`);
          }
        }
      }
    }

    if (dryRun) {
      this.logger.info(`🧹 Dry run: Would delete ${result.deleted} files, freeing ${this.formatBytes(result.freedSpace)}`);
    } else {
      this.logger.success(`🧹 Cleaned ${result.deleted} files, freed ${this.formatBytes(result.freedSpace)}`);
    }

    return result;
  }

  /**
   * Get junk file statistics
   */
  async getJunkStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    largestFiles: JunkFileResult[];
    oldestFiles: JunkFileResult[];
    categories: Record<string, { count: number; size: number }>;
  }> {
    const detection = await this.detectJunkFiles();
    
    const allFiles = Object.values(detection.categories)
      .flatMap(category => category.files);

    const largestFiles = allFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    const oldestFiles = allFiles
      .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
      .slice(0, 10);

    const categories: Record<string, { count: number; size: number }> = {};
    for (const [category, data] of Object.entries(detection.categories)) {
      categories[category] = {
        count: data.count,
        size: data.size
      };
    }

    return {
      totalFiles: detection.totalFiles,
      totalSize: detection.totalSize,
      largestFiles,
      oldestFiles,
      categories
    };
  }

  /**
   * Scan a specific category of junk files
   */
  private async scanCategory(category: string, patterns: string[]): Promise<JunkFileResult[]> {
    const files: JunkFileResult[] = [];

    for (const pattern of patterns) {
      const matches = await this.findFiles(pattern);
      
      for (const filePath of matches) {
        try {
          const stats = await stat(filePath);
          const fileInfo: JunkFileResult = {
            path: filePath,
            category,
            reason: this.getJunkReason(category, filePath),
            size: stats.size,
            lastModified: stats.mtime,
            canDelete: this.canDeleteFile(category, filePath),
            suggestion: this.getSuggestion(category, filePath)
          };
          files.push(fileInfo);
        } catch (error) {
          this.logger.warn(`⚠️  Failed to stat ${filePath}: ${error}`);
        }
      }
    }

    return files;
  }

  /**
   * Find files matching a pattern
   */
  private async findFiles(pattern: string): Promise<string[]> {
    const files: string[] = [];
    const { readdir, stat } = await import("fs/promises");
    const { join } = await import("path");

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            // Skip certain directories
            if (this.shouldSkipDirectory(entry)) {
              continue;
            }
            await scanDirectory(fullPath);
          } else if (stats.isFile()) {
            if (this.matchesPattern(fullPath, pattern)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await scanDirectory(this.projectRoot);
    return files;
  }

  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      "node_modules",
      ".git",
      ".vscode",
      ".idea",
      "third_party",
      "venv",
      ".venv",
      "env",
      ".env"
    ];
    return skipDirs.includes(dirName);
  }

  /**
   * Check if file matches pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    const fileName = filePath.split("/").pop() || "";
    
    // Handle glob patterns
    if (pattern.includes("*")) {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(fileName);
    }
    
    // Handle exact matches
    if (pattern.startsWith("**/")) {
      return filePath.includes(pattern.substring(3));
    }
    
    return fileName === pattern || filePath.endsWith(pattern);
  }

  /**
   * Get reason why file is considered junk
   */
  private getJunkReason(category: string, filePath: string): string {
    switch (category) {
      case "buildArtifacts":
        return "Build artifact that can be regenerated";
      case "cacheFiles":
        return "Cache file that can be safely deleted";
      case "temporaryFiles":
        return "Temporary file that should be cleaned up";
      case "logFiles":
        return "Log file that can be archived or deleted";
      case "lockFiles":
        return "Lock file that may be stale";
      default:
        return "Junk file that can be safely removed";
    }
  }

  /**
   * Check if file can be safely deleted
   */
  private canDeleteFile(category: string, filePath: string): boolean {
    // Some files should not be deleted
    const protectedFiles = [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml"
    ];
    
    const fileName = filePath.split("/").pop() || "";
    if (protectedFiles.includes(fileName)) {
      return false;
    }
    
    // Lock files in git repos should be handled carefully
    if (category === "lockFiles" && existsSync(join(this.projectRoot, ".git"))) {
      return false;
    }
    
    return true;
  }

  /**
   * Get suggestion for file
   */
  private getSuggestion(category: string, filePath: string): string {
    switch (category) {
      case "buildArtifacts":
        return "Run build command to regenerate";
      case "cacheFiles":
        return "Cache will be rebuilt automatically";
      case "temporaryFiles":
        return "Safe to delete";
      case "logFiles":
        return "Consider archiving before deletion";
      case "lockFiles":
        return "Check if lock file is still needed";
      default:
        return "Review before deletion";
    }
  }

  /**
   * Log junk detection results
   */
  private logJunkDetectionResults(result: JunkDetectionResult): void {
    if (!result.hasJunk) {
      this.logger.success("✅ No junk files found");
      return;
    }

    this.logger.warn(`⚠️  Found ${result.totalFiles} junk files (${this.formatBytes(result.totalSize)})`);
    
    for (const [category, data] of Object.entries(result.categories)) {
      this.logger.info(`📁 ${category}: ${data.count} files (${this.formatBytes(data.size)})`);
    }
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

  /**
   * Initialize junk file patterns
   */
  private initializePatterns(): JunkPatterns {
    return {
      buildArtifacts: [
        "**/dist/**",
        "**/build/**",
        "**/.next/**",
        "**/.nuxt/**",
        "**/out/**",
        "**/target/**",
        "**/bin/**",
        "**/obj/**",
        "**/*.o",
        "**/*.so",
        "**/*.dylib",
        "**/*.dll",
        "**/*.exe"
      ],
      cacheFiles: [
        "**/.cache/**",
        "**/.parcel-cache/**",
        "**/.eslintcache",
        "**/.stylelintcache",
        "**/.mypy_cache/**",
        "**/__pycache__/**",
        "**/.pytest_cache/**",
        "**/.tox/**",
        "**/node_modules/.cache/**",
        "**/.turbo/**",
        "**/.nx/**"
      ],
      temporaryFiles: [
        "**/*.tmp",
        "**/*.temp",
        "**/*.swp",
        "**/*.swo",
        "**/~*",
        "**/.DS_Store",
        "**/Thumbs.db",
        "**/*.log",
        "**/*.pid",
        "**/*.lock"
      ],
      logFiles: [
        "**/*.log",
        "**/logs/**",
        "**/npm-debug.log*",
        "**/yarn-debug.log*",
        "**/yarn-error.log*",
        "**/lerna-debug.log*"
      ],
      lockFiles: [
        "**/package-lock.json",
        "**/yarn.lock",
        "**/pnpm-lock.yaml",
        "**/composer.lock",
        "**/Gemfile.lock",
        "**/Pipfile.lock",
        "**/poetry.lock"
      ],
      other: [
        "**/.coverage",
        "**/coverage/**",
        "**/htmlcov/**",
        "**/.nyc_output/**",
        "**/test-results/**",
        "**/playwright-report/**",
        "**/dombench-results/**",
        "**/results/**",
        "**/*.tsbuildinfo",
        "**/.vscode/settings.json",
        "**/.idea/workspace.xml"
      ]
    };
  }
}
