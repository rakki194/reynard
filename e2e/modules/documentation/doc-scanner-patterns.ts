/**
 * Documentation Scanner Pattern Matching
 *
 * Handles pattern-based scanning of documentation files across the project.
 */

import { readdirSync } from "fs";
import { join } from "path";
import { DocumentationScannerCore, ICodeExample } from "./doc-scanner-core.js";

/**
 * Pattern-based Documentation Scanner
 */
export class DocumentationScannerPatterns extends DocumentationScannerCore {
  /**
   * Scan all documentation files in the project
   */
  async scanAllDocumentation(): Promise<ICodeExample[]> {
    console.log("🦩 Scanning documentation files for code examples...");
    
    const docPaths = [
      "README.md",
      "docs/",
      "packages/*/README.md",
      "examples/*/README.md",
      "templates/*/README.md",
      "e2e/README.md",
      "CONTRIBUTING.md",
      "CHANGELOG.md"
    ];

    for (const pattern of docPaths) {
      await this.scanPattern(pattern);
    }

    console.log(`🦩 Found ${this.codeExamples.length} code examples across ${this.scannedFiles.size} files`);
    return this.codeExamples;
  }

  /**
   * Scan files matching a pattern
   */
  private async scanPattern(pattern: string): Promise<void> {
    if (pattern.includes("*")) {
      // Handle glob patterns
      const basePath = pattern.split("*")[0];
      const searchPath = join(this.projectRoot, basePath);
      
      try {
        const entries = readdirSync(searchPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            await this.scanDirectory(join(searchPath, entry.name));
          } else if (this.isDocumentationFile(entry.name)) {
            await this.scanFile(join(basePath, entry.name));
          }
        }
      } catch (error) {
        // Directory might not exist, skip silently
      }
    } else {
      // Handle specific files
      await this.scanFile(pattern);
    }
  }

  /**
   * Recursively scan a directory
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (this.isDocumentationFile(entry.name)) {
          const relativePath = fullPath.replace(this.projectRoot + "/", "");
          await this.scanFile(relativePath);
        }
      }
    } catch (error) {
      // Directory might not be accessible, skip silently
    }
  }
}

