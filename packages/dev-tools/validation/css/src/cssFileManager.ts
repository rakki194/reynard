/**
 * 🦊 CSS File Manager
 * Extends catalyst FileManager with CSS-specific functionality
 */

import { FileManager as CatalystFileManager, type ReynardLogger } from "reynard-dev-tools-catalyst";
import path from "path";
import type { CSSFile, CSSImport, ValidatorConfig } from "./types.js";

export class CSSFileManager extends CatalystFileManager {
  private config: ValidatorConfig;

  constructor(config: ValidatorConfig, logger?: ReynardLogger) {
    super({
      projectRoot: process.cwd(),
      excludePatterns: [
        /node_modules/,
        /\.git/,
        /\.vscode/,
        /\.idea/,
        /dist/,
        /build/,
        /coverage/,
        /\.nyc_output/,
        /third_party/,
      ],
      includePatterns: [/\.css$/],
      verbose: config.verbose || false,
    });
    this.config = config;
  }

  /**
   * Resolve a path relative to project root
   */
  private resolvePath(relativePath: string): string {
    return path.resolve(this.projectRoot, relativePath);
  }

  /**
   * Find all CSS files in the project
   */
  findCSSFiles(): CSSFile[] {
    if (this.logger) {
      this.logger.verbose("🔍 Scanning for CSS files in Reynard projects...");
    }

    const cssFiles: CSSFile[] = [];

    for (const scanDir of this.config.scanDirs) {
      const fullPath = this.resolvePath(scanDir);
      if (this.fileExists(fullPath)) {
        const files = this.scanDirectory(fullPath, { extensions: [".css"] });
        cssFiles.push(
          ...files.map(file => ({
            path: file.path,
            name: file.name,
            size: file.size,
            modified: file.modified,
            readable: file.readable,
          }))
        );
      }
    }

    if (this.logger) {
      this.logger.verbose(`📊 Found ${cssFiles.length} CSS files`);

      if (this.config.verbose) {
        this.printFileBreakdown(cssFiles);
      }
    }

    return cssFiles;
  }

  /**
   * Print breakdown of found files by project type
   */
  private printFileBreakdown(cssFiles: CSSFile[]): void {
    if (!this.logger) return;

    const reynardMain = cssFiles.filter(f => f.path.includes("/reynard/") && !f.path.includes("/reynard-"));
    const reynardApps = cssFiles.filter(f => f.path.includes("/reynard-"));

    this.logger.info(`Main reynard directory: ${reynardMain.length} files`);
    this.logger.info(`Reynard apps (reynard-*): ${reynardApps.length} files`);

    if (reynardMain.length > 0) {
      this.logger.verbose("📁 Main reynard directory files:");
      reynardMain.forEach(f => {
        const relativePath = path.relative(this.projectRoot, f.path);
        this.logger?.verbose(`    ${relativePath}`);
      });
    }

    if (reynardApps.length > 0) {
      this.logger.verbose("📱 Reynard apps files:");
      reynardApps.forEach(f => {
        const relativePath = path.relative(this.projectRoot, f.path);
        this.logger?.verbose(`    ${relativePath}`);
      });
    }
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
      if (this.fileExists(fullPath)) {
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
}
