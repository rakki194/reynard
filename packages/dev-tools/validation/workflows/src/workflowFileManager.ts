/**
 * 🐺 Workflow File Manager
 * Extends catalyst FileManager with workflow-specific functionality
 */

import { FileManager as CatalystFileManager } from "reynard-dev-tools-catalyst";
import type { ReynardLogger } from "reynard-dev-tools-catalyst";
import fs from "fs";
import path from "path";
import type { WorkflowFile } from "./types.js";

export class WorkflowFileManager extends CatalystFileManager {
  private workflowDir: string;
  private tempDir: string;

  constructor(
    workflowDir: string,
    tempDir: string,
    includePatterns: string[],
    excludePatterns: string[],
    logger?: ReynardLogger
  ) {
    super({
      projectRoot: process.cwd(),
      excludePatterns: excludePatterns.map(pattern => new RegExp(pattern.replace(/\*/g, ".*"))),
      includePatterns: includePatterns.map(pattern => new RegExp(pattern.replace(/\*/g, ".*"))),
      verbose: logger ? true : false,
    });
    this.workflowDir = workflowDir;
    this.tempDir = tempDir;
  }

  /**
   * Find all workflow files
   */
  findWorkflowFiles(): WorkflowFile[] {
    if (!fs.existsSync(this.workflowDir)) {
      this.logger?.warn(`Workflow directory not found: ${this.workflowDir}`);
      return [];
    }

    const files = this.scanDirectory(this.workflowDir, {
      extensions: [".yml", ".yaml"],
      recursive: false,
    });

    return files.map(file => ({
      path: file.path,
      name: file.name,
      size: file.size,
      modified: file.modified,
      readable: file.readable,
    }));
  }

  /**
   * Clean up temporary files
   */
  override cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      this.logger?.info(`Cleaning up temporary directory: ${this.tempDir}`);
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      this.logger?.info(`Creating temporary directory: ${this.tempDir}`);
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
}
