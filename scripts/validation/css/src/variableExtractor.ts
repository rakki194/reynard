/**
 * 🦊 CSS Variable Extractor
 * Extracts CSS variables, imports, and themes from CSS files
 */

import type { CSSFileVariables, CSSVariableDefinition, CSSVariableUsage, CSSImport } from "./types.js";
import { FileManager } from "./fileManager.js";
import { CSSLogger } from "./logger.js";

export class VariableExtractor {
  private fileManager: FileManager;
  private logger: CSSLogger;

  constructor(fileManager: FileManager, logger: CSSLogger) {
    this.fileManager = fileManager;
    this.logger = logger;
  }

  /**
   * Extract CSS variables from a file, including imported files
   */
  extractVariables(filePath: string, visitedFiles = new Set<string>()): CSSFileVariables {
    // Prevent circular imports
    if (visitedFiles.has(filePath)) {
      return {
        definitions: [],
        usage: [],
        themes: new Map(),
        imports: [],
      };
    }

    visitedFiles.add(filePath);

    const content = this.fileManager.readFile(filePath);
    if (!content) {
      visitedFiles.delete(filePath);
      return {
        definitions: [],
        usage: [],
        themes: new Map(),
        imports: [],
      };
    }

    const fileVariables = this.parseFileContent(content, filePath);

    // Process imports and include their variables
    const imports = this.fileManager.extractImports(filePath);
    fileVariables.imports = imports;

    for (const importInfo of imports) {
      if (this.fileManager.fileExists(importInfo.resolvedPath)) {
        try {
          const importedVars = this.extractVariables(importInfo.resolvedPath, visitedFiles);

          // Add imported definitions with import context
          for (const def of importedVars.definitions) {
            fileVariables.definitions.push({
              ...def,
              importedFrom: importInfo.resolvedPath,
              importedVia: filePath,
            });
          }

          // Add imported usage
          for (const usage of importedVars.usage) {
            fileVariables.usage.push({
              ...usage,
              importedFrom: importInfo.resolvedPath,
              importedVia: filePath,
            });
          }
        } catch {
          // Skip files that can't be read (permissions, etc.)
          this.logger.warn(`Could not read imported file: ${importInfo.resolvedPath}`);
        }
      } else {
        this.logger.warn(`Imported file not found: ${importInfo.resolvedPath}`);
      }
    }

    visitedFiles.delete(filePath);
    return fileVariables;
  }

  /**
   * Parse CSS file content to extract variables and themes
   */
  private parseFileContent(content: string, filePath: string): CSSFileVariables {
    const lines = content.split("\n");
    const fileVariables: CSSFileVariables = {
      definitions: [],
      usage: [],
      themes: new Map(),
      imports: [],
    };

    let currentTheme = "default";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line || line.startsWith("/*") || line.startsWith("*")) continue;

      // Check for theme selectors
      const themeMatch = line.match(/:root\[data-theme="([^"]+)"\]/);
      if (themeMatch && themeMatch[1]) {
        currentTheme = themeMatch[1];
        fileVariables.themes.set(currentTheme, line);
        continue;
      }

      // Extract variable definitions (including multi-line)
      const varDefMatch = line.match(/--([a-zA-Z0-9-]+)\s*:\s*(.*)/);
      if (varDefMatch && varDefMatch[1] && varDefMatch[2]) {
        const [, varName, varValueStart] = varDefMatch;

        if (varValueStart.includes(";")) {
          // Single line definition
          const value = varValueStart.replace(/;.*$/, "").trim();
          fileVariables.definitions.push({
            name: varName,
            value: value,
            line: i + 1,
            theme: currentTheme,
            file: filePath,
            context: line,
          });
        } else {
          // Multi-line definition - collect until we find the closing semicolon
          let fullValue = varValueStart;
          let j = i + 1;

          while (j < lines.length && !fullValue.includes(";")) {
            const nextLine = lines[j]?.trim();
            if (nextLine) {
              fullValue += " " + nextLine;
            }
            j++;
          }

          // Extract the value (everything before the semicolon)
          const value = fullValue.replace(/;.*$/, "").trim();

          fileVariables.definitions.push({
            name: varName,
            value: value,
            line: i + 1,
            theme: currentTheme,
            file: filePath,
            context: lines.slice(i, j).join(" ").trim(),
          });

          // Skip the lines we've already processed
          i = j - 1;
        }
      }

      // Extract variable usage
      const varUsageMatches = line.matchAll(/var\(--([a-zA-Z0-9-]+)\)/g);
      for (const match of varUsageMatches) {
        if (match[1]) {
          fileVariables.usage.push({
            name: match[1],
            line: i + 1,
            file: filePath,
            context: line,
          });
        }
      }
    }

    return fileVariables;
  }

  /**
   * Extract variables from multiple files
   */
  extractFromFiles(filePaths: string[]): {
    definitions: Map<string, CSSVariableDefinition[]>;
    usage: Map<string, CSSVariableUsage[]>;
    themes: Map<string, Map<string, string>>;
    imports: CSSImport[];
  } {
    const definitions = new Map<string, CSSVariableDefinition[]>();
    const usage = new Map<string, CSSVariableUsage[]>();
    const themes = new Map<string, Map<string, string>>();
    const allImports: CSSImport[] = [];

    for (const filePath of filePaths) {
      this.logger.fileInfo(filePath, "processing");

      try {
        const fileVars = this.extractVariables(filePath);

        // Show import information in verbose mode
        if (fileVars.imports.length > 0) {
          this.logger.verbose(`📦 ${this.fileManager.getRelativePath(filePath)} imports:`);
          for (const imp of fileVars.imports) {
            const importRelativePath = this.fileManager.getRelativePath(imp.resolvedPath);
            const exists = this.fileManager.fileExists(imp.resolvedPath);
            this.logger.importInfo(imp.originalPath, importRelativePath, exists);
          }
        }

        // Add definitions to global map
        for (const def of fileVars.definitions) {
          if (!definitions.has(def.name)) {
            definitions.set(def.name, []);
          }
          const defArray = definitions.get(def.name);
          if (defArray) {
            defArray.push(def);
          }
        }

        // Add usage to global map
        for (const usageItem of fileVars.usage) {
          if (!usage.has(usageItem.name)) {
            usage.set(usageItem.name, []);
          }
          const usageArray = usage.get(usageItem.name);
          if (usageArray) {
            usageArray.push(usageItem);
          }
        }

        // Add themes
        if (fileVars.themes.size > 0) {
          themes.set(filePath, fileVars.themes);
        }

        // Add imports
        allImports.push(...fileVars.imports);

        this.logger.fileInfo(filePath, "completed");
      } catch (error) {
        this.logger.error(`Error reading ${filePath}: ${(error as Error).message}`);
        this.logger.fileInfo(filePath, "error");
      }
    }

    return { definitions, usage, themes, imports: allImports };
  }

  /**
   * Get variable statistics for a file
   */
  getFileStatistics(filePath: string): {
    definitions: number;
    usage: number;
    themes: number;
    imports: number;
  } {
    const fileVars = this.extractVariables(filePath);

    return {
      definitions: fileVars.definitions.length,
      usage: fileVars.usage.length,
      themes: fileVars.themes.size,
      imports: fileVars.imports.length,
    };
  }

  /**
   * Check if a variable is likely used by external tools
   */
  isLikelyExternalVariable(varName: string): boolean {
    const externalPatterns = [/^z-/, /^shadow-/, /^transition-/, /^animation-/, /^font-/, /^spacing-/, /^breakpoint-/];

    return externalPatterns.some(pattern => pattern.test(varName));
  }
}
