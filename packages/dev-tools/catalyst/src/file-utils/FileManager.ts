/**
 * ⚗️ Catalyst File Manager
 * Unified file operations for all Reynard dev-tools
 */

import fs from "fs";
import path from "path";
import type { FileInfo, FileManagerOptions, ScanOptions, BackupResult } from "../types/FileUtils.js";
import { FileExclusionManager } from "./FileExclusionManager.js";
import { FileTypeDetector } from "./FileTypeDetector.js";
import type { Logger } from "../types/Logger.js";

export class FileManager {
  protected readonly projectRoot: string;
  protected readonly excludePatterns: RegExp[];
  protected readonly includePatterns: RegExp[];
  protected readonly verbose: boolean;
  protected readonly logger?: Logger;

  constructor(options: FileManagerOptions = {}) {
    this.projectRoot = options.projectRoot || this.findProjectRoot();
    this.excludePatterns = options.excludePatterns || [];
    this.includePatterns = options.includePatterns || [];
    this.verbose = options.verbose || false;
    this.logger = options.verbose
      ? {
          log: (msg: string) => console.log(msg),
          info: (msg: string) => console.log(`ℹ️  ${msg}`),
          warn: (msg: string) => console.warn(`⚠️  ${msg}`),
          error: (msg: string) => console.error(`❌ ${msg}`),
          success: (msg: string) => console.log(`✅ ${msg}`),
          debug: (msg: string) => console.log(`🔍 ${msg}`),
          section: (title: string) => console.log(`\n🎯 ${title}\n${"=".repeat(30)}`),
          header: (title: string) => console.log(`\n${title}\n${"=".repeat(title.length)}`),
          verbose: (msg: string) => console.log(`🔍 ${msg}`),
        }
      : undefined;
  }

  /**
   * Find the project root directory
   */
  private findProjectRoot(): string {
    let currentDir = process.cwd();

    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, "package.json"))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return process.cwd();
  }

  /**
   * Recursively scan directory for files with specific extensions
   */
  scanDirectory(dirPath: string, options: ScanOptions = {}): FileInfo[] {
    const {
      extensions = [],
      recursive = true,
      excludeDirs = [
        "node_modules",
        ".git",
        ".vscode",
        ".idea",
        "dist",
        "build",
        "coverage",
        ".nyc_output",
        "third_party",
      ],
      includeDirs = [],
    } = options;

    const files: FileInfo[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.shouldSkipDirectory(entry.name, excludeDirs, includeDirs)) {
            continue;
          }

          if (recursive) {
            files.push(...this.scanDirectory(fullPath, options));
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.length === 0 || extensions.includes(ext)) {
            const stats = fs.statSync(fullPath);
            files.push({
              path: fullPath,
              name: entry.name,
              size: stats.size,
              modified: stats.mtime,
              readable: true,
            });
          }
        }
      }
    } catch (error) {
      if (this.logger) {
        this.logger.warn(`Could not read directory ${dirPath}: ${(error as Error).message}`);
      }
    }

    return files;
  }

  /**
   * Check if directory should be skipped during scanning
   */
  private shouldSkipDirectory(dirName: string, excludeDirs: string[], includeDirs: string[]): boolean {
    // If includeDirs is specified, only include those directories
    if (includeDirs.length > 0) {
      return !includeDirs.includes(dirName);
    }

    // Otherwise, exclude the standard directories
    return excludeDirs.includes(dirName) || dirName.startsWith(".");
  }

  /**
   * Safely read file content
   */
  readFile(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      if (this.logger) {
        this.logger.warn(`Could not read file ${filePath}: ${(error as Error).message}`);
      }
      return null;
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Write content to a file
   */
  writeFile(filePath: string, content: string): boolean {
    try {
      fs.writeFileSync(filePath, content, "utf-8");
      return true;
    } catch (error) {
      if (this.logger) {
        this.logger.error(`Could not write file ${filePath}: ${(error as Error).message}`);
      }
      return false;
    }
  }

  /**
   * Create a backup of a file
   */
  createBackup(filePath: string, backupDir?: string): BackupResult {
    try {
      const backupDirPath = backupDir || path.join(this.projectRoot, ".catalyst-backups");

      // Ensure backup directory exists
      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = path.basename(filePath);
      const backupPath = path.join(backupDirPath, `${fileName}.${timestamp}.backup`);

      fs.copyFileSync(filePath, backupPath);
      return { success: true, backupPath };
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (this.logger) {
        this.logger.error(`Could not create backup for ${filePath}: ${errorMessage}`);
      }
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get relative path from project root
   */
  getRelativePath(filePath: string): string {
    return path.relative(this.projectRoot, filePath);
  }

  /**
   * Get project root directory
   */
  getProjectRoot(): string {
    return this.projectRoot;
  }

  /**
   * Check if file should be excluded
   */
  shouldExcludeFile(filePath: string): boolean {
    // Check against built-in exclusion patterns
    if (FileExclusionManager.shouldExcludeFile(filePath)) {
      return true;
    }

    // Check against custom exclusion patterns
    for (const pattern of this.excludePatterns) {
      if (pattern.test(filePath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if file should be included
   */
  shouldIncludeFile(filePath: string): boolean {
    // First check if file should be excluded
    if (this.shouldExcludeFile(filePath)) {
      return false;
    }

    // If no include patterns, include all non-excluded files
    if (this.includePatterns.length === 0) {
      return true;
    }

    // Check against include patterns
    for (const pattern of this.includePatterns) {
      if (pattern.test(filePath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get file type for a file path
   */
  getFileType(filePath: string): string | null {
    return FileTypeDetector.getFileType(filePath);
  }

  /**
   * Ensure directory exists
   */
  ensureDirectory(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return true;
    } catch (error) {
      if (this.logger) {
        this.logger.error(`Could not create directory ${dirPath}: ${(error as Error).message}`);
      }
      return false;
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup(tempDir: string): void {
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tempDir, file));
        }
        fs.rmdirSync(tempDir);
      }
    } catch (error) {
      if (this.logger) {
        this.logger.warn(`Could not cleanup directory ${tempDir}: ${(error as Error).message}`);
      }
    }
  }
}
