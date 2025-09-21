/**
 * 🐺 File Manager Module
 * Handles file system operations for workflow files and cleanup
 */

import fs from "fs";
import path from "path";
import type { WorkflowFile } from "./types.js";
import type { Logger } from "./types.js";

export class FileManager {
  constructor(
    private logger: Logger,
    private workflowDir: string,
    private tempDir: string,
    private includePatterns: string[],
    private excludePatterns: string[]
  ) {}

  /**
   * Find all workflow files
   */
  findWorkflowFiles(): WorkflowFile[] {
    if (!fs.existsSync(this.workflowDir)) {
      return [];
    }

    const files = fs.readdirSync(this.workflowDir);
    const workflowFiles: WorkflowFile[] = [];

    for (const file of files) {
      const filePath = path.join(this.workflowDir, file);
      const stats = fs.statSync(filePath);

      if (this.shouldIncludeFile(file, stats)) {
        workflowFiles.push({
          path: filePath,
          name: file,
          size: stats.size,
          modified: stats.mtime,
          readable: true,
        });
      }
    }

    return workflowFiles;
  }

  /**
   * Clean up temporary files
   */
  cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      const files = fs.readdirSync(this.tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.tempDir, file));
      }
      fs.rmdirSync(this.tempDir);
    }
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  private shouldIncludeFile(file: string, stats: fs.Stats): boolean {
    const matchesInclude = this.matchesPatterns(file, this.includePatterns);
    const matchesExclude = this.matchesPatterns(file, this.excludePatterns);
    return matchesInclude && !matchesExclude && stats.isFile();
  }

  private matchesPatterns(file: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(file);
    });
  }
}
