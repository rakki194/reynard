/**
 * 🦊 CSS File Manager
 * Handles file operations, scanning, and import resolution for CSS files
 */

import fs from "fs";
import path from "path";
import type { CSSFile, CSSImport, ValidatorConfig } from "./types.js";
import { CSSLogger } from "./logger.js";

export class FileManager {
  private logger: CSSLogger;
  private config: ValidatorConfig;
  private projectRoot: string;

  constructor(config: ValidatorConfig, logger: CSSLogger) {
    this.config = config;
    this.logger = logger;
    this.projectRoot = this.findProjectRoot();
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
   * Find all CSS files in the project
   */
  findCSSFiles(): CSSFile[] {
    this.logger.verbose("🔍 Scanning for CSS files in Reynard projects...");

    const cssFiles: CSSFile[] = [];

    for (const scanDir of this.config.scanDirs) {
      const fullPath = path.join(this.projectRoot, scanDir);
      if (fs.existsSync(fullPath)) {
        const files = this.scanDirectory(fullPath, [".css"]);
        cssFiles.push(...files);
      }
    }

    this.logger.verbose(`📊 Found ${cssFiles.length} CSS files`);

    if (this.config.verbose) {
      this.printFileBreakdown(cssFiles);
    }

    return cssFiles;
  }

  /**
   * Print breakdown of found files by project type
   */
  private printFileBreakdown(cssFiles: CSSFile[]): void {
    const reynardMain = cssFiles.filter(f => f.path.includes("/reynard/") && !f.path.includes("/reynard-"));
    const reynardApps = cssFiles.filter(f => f.path.includes("/reynard-"));

    this.logger.info(`Main reynard directory: ${reynardMain.length} files`);
    this.logger.info(`Reynard apps (reynard-*): ${reynardApps.length} files`);

    if (reynardMain.length > 0) {
      this.logger.verbose("📁 Main reynard directory files:");
      reynardMain.forEach(f => {
        const relativePath = path.relative(this.projectRoot, f.path);
        this.logger.verbose(`    ${relativePath}`);
      });
    }

    if (reynardApps.length > 0) {
      this.logger.verbose("📱 Reynard apps files:");
      reynardApps.forEach(f => {
        const relativePath = path.relative(this.projectRoot, f.path);
        this.logger.verbose(`    ${relativePath}`);
      });
    }
  }

  /**
   * Recursively scan directory for files with specific extensions
   */
  private scanDirectory(dirPath: string, extensions: string[]): CSSFile[] {
    const files: CSSFile[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules, .git, and other common directories
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }
          files.push(...this.scanDirectory(fullPath, extensions));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
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
      this.logger.warn(`Could not read directory ${dirPath}: ${(error as Error).message}`);
    }

    return files;
  }

  /**
   * Check if directory should be skipped during scanning
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      "node_modules",
      ".git",
      ".vscode",
      ".idea",
      "dist",
      "build",
      "coverage",
      ".nyc_output",
      "third_party",
    ];

    return skipDirs.includes(dirName) || dirName.startsWith(".");
  }

  /**
   * Safely read file content
   */
  readFile(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      this.logger.warn(`Could not read file ${filePath}: ${(error as Error).message}`);
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
   * Resolve CSS import path relative to the importing file
   */
  resolveImportPath(importPath: string, importingFile: string): string {
    // Remove quotes from import path
    const cleanPath = importPath.replace(/['"]/g, "");

    // Handle absolute paths (starting with /)
    if (cleanPath.startsWith("/")) {
      return cleanPath;
    }

    // Handle relative paths
    const importingDir = path.dirname(importingFile);
    const resolvedPath = path.resolve(importingDir, cleanPath);

    // Try different extensions if the file doesn't exist
    const extensions = ["", ".css"];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return resolvedPath;
  }

  /**
   * Extract CSS imports from a file
   */
  extractImports(filePath: string): CSSImport[] {
    const content = this.readFile(filePath);
    if (!content) return [];

    const lines = content.split("\n");
    const imports: CSSImport[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line || line.startsWith("/*") || line.startsWith("*")) continue;

      // Match @import statements
      const importMatch = line.match(/@import\s+['"]([^'"]+)['"]\s*;?/);
      if (importMatch && importMatch[1]) {
        const importPath = importMatch[1];
        const resolvedPath = this.resolveImportPath(importPath, filePath);

        imports.push({
          originalPath: importPath,
          resolvedPath: resolvedPath,
          line: i + 1,
          importingFile: filePath,
        });
      }
    }

    return imports;
  }

  /**
   * Write content to a file
   */
  writeFile(filePath: string, content: string): boolean {
    try {
      fs.writeFileSync(filePath, content, "utf-8");
      return true;
    } catch (error) {
      this.logger.error(`Could not write file ${filePath}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Create a backup of a file
   */
  createBackup(filePath: string, backupDir?: string): string | null {
    try {
      const backupDirPath = backupDir || path.join(this.projectRoot, ".css-validator-backups");

      // Ensure backup directory exists
      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = path.basename(filePath);
      const backupPath = path.join(backupDirPath, `${fileName}.${timestamp}.backup`);

      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    } catch (error) {
      this.logger.error(`Could not create backup for ${filePath}: ${(error as Error).message}`);
      return null;
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
}
