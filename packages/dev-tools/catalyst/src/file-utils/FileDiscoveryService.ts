/**
 * 🦊 Reynard File Discovery Service
 * 
 * Enhanced file discovery service that consolidates functionality
 * from code-quality and other packages into a unified system.
 */

import { readFile, readdir, stat } from "fs/promises";
import { extname, join, resolve } from "path";
import { ReynardLogger } from "../logger/ReynardLogger.js";
import type { FileInfo, FileType } from "../types/FileUtils.js";

export interface DiscoveryOptions {
  projectRoot?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  maxDepth?: number;
  followSymlinks?: boolean;
  includeHidden?: boolean;
}

export interface LanguageInfo {
  name: string;
  extensions: string[];
  mimeTypes: string[];
  category: "programming" | "markup" | "data" | "config" | "documentation" | "other";
}

export class FileDiscoveryService {
  private logger: ReynardLogger;
  private projectRoot: string;
  private languageMap: Map<string, LanguageInfo> = new Map();

  constructor(options: DiscoveryOptions = {}, logger?: ReynardLogger) {
    this.projectRoot = resolve(options.projectRoot || process.cwd());
    this.logger = logger || new ReynardLogger();
    this.initializeLanguageMap();
  }

  /**
   * Discover all files in the project
   */
  async discoverFiles(options: DiscoveryOptions = {}): Promise<FileInfo[]> {
    const startTime = Date.now();
    this.logger.info("🔍 Discovering files in project...");

    const files: FileInfo[] = [];
    const includePatterns = options.includePatterns || ["**/*"];
    const excludePatterns = options.excludePatterns || [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/third_party/**"
    ];

    try {
      for (const pattern of includePatterns) {
        const patternFiles = await this.scanDirectory(
          this.projectRoot,
          pattern,
          excludePatterns,
          options.maxDepth || 10,
          options.followSymlinks || false,
          options.includeHidden || false
        );
        files.push(...patternFiles);
      }

      // Remove duplicates
      const uniqueFiles = this.removeDuplicates(files);
      
      this.logger.success(`✅ Discovered ${uniqueFiles.length} files in ${Date.now() - startTime}ms`);
      return uniqueFiles;
    } catch (error) {
      this.logger.error(`❌ File discovery failed: ${error}`);
      throw error;
    }
  }

  /**
   * Count lines in a file
   */
  async countLines(filePath: string): Promise<number> {
    try {
      const content = await readFile(filePath, "utf8");
      return content.split("\n").length;
    } catch (error) {
      this.logger.warn(`⚠️  Failed to count lines in ${filePath}: ${error}`);
      return 0;
    }
  }

  /**
   * Detect language of a file
   */
  detectLanguage(filePath: string): string {
    const extension = extname(filePath).toLowerCase();
    const language = this.languageMap.get(extension);
    return language?.name || "unknown";
  }

  /**
   * Get file statistics
   */
  async getFileStats(filePath: string): Promise<{
    size: number;
    lines: number;
    language: string;
    lastModified: Date;
    isBinary: boolean;
  }> {
    try {
      const stats = await stat(filePath);
      const lines = await this.countLines(filePath);
      const language = this.detectLanguage(filePath);
      const isBinary = await this.isBinaryFile(filePath);

      return {
        size: stats.size,
        lines,
        language,
        lastModified: stats.mtime,
        isBinary
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get file stats for ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Find files by language
   */
  async findFilesByLanguage(language: string, options: DiscoveryOptions = {}): Promise<FileInfo[]> {
    const allFiles = await this.discoverFiles(options);
    const languageInfo = Array.from(this.languageMap.values()).find(l => l.name === language);
    
    if (!languageInfo) {
      this.logger.warn(`⚠️  Unknown language: ${language}`);
      return [];
    }

    return allFiles.filter(file => 
      languageInfo.extensions.includes(extname(file.path).toLowerCase())
    );
  }

  /**
   * Find files by category
   */
  async findFilesByCategory(category: LanguageInfo["category"], options: DiscoveryOptions = {}): Promise<FileInfo[]> {
    const allFiles = await this.discoverFiles(options);
    const categoryLanguages = Array.from(this.languageMap.values())
      .filter(l => l.category === category)
      .flatMap(l => l.extensions);

    return allFiles.filter(file => 
      categoryLanguages.includes(extname(file.path).toLowerCase())
    );
  }

  /**
   * Get project statistics
   */
  async getProjectStats(options: DiscoveryOptions = {}): Promise<{
    totalFiles: number;
    totalLines: number;
    totalSize: number;
    languages: Record<string, { files: number; lines: number; size: number }>;
    categories: Record<string, { files: number; lines: number; size: number }>;
  }> {
    const files = await this.discoverFiles(options);
    const stats = {
      totalFiles: files.length,
      totalLines: 0,
      totalSize: 0,
      languages: {} as Record<string, { files: number; lines: number; size: number }>,
      categories: {} as Record<string, { files: number; lines: number; size: number }>
    };

    for (const file of files) {
      const fileStats = await this.getFileStats(file.path);
      const language = fileStats.language;
      const category = this.languageMap.get(extname(file.path).toLowerCase())?.category || "other";

      stats.totalLines += fileStats.lines;
      stats.totalSize += fileStats.size;

      // Language stats
      if (!stats.languages[language]) {
        stats.languages[language] = { files: 0, lines: 0, size: 0 };
      }
      stats.languages[language].files++;
      stats.languages[language].lines += fileStats.lines;
      stats.languages[language].size += fileStats.size;

      // Category stats
      if (!stats.categories[category]) {
        stats.categories[category] = { files: 0, lines: 0, size: 0 };
      }
      stats.categories[category].files++;
      stats.categories[category].lines += fileStats.lines;
      stats.categories[category].size += fileStats.size;
    }

    return stats;
  }

  /**
   * Scan directory recursively
   */
  private async scanDirectory(
    dir: string,
    pattern: string,
    excludePatterns: string[],
    maxDepth: number,
    followSymlinks: boolean,
    includeHidden: boolean,
    currentDepth: number = 0
  ): Promise<FileInfo[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const files: FileInfo[] = [];

    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        // Skip hidden files if not including them
        if (!includeHidden && entry.startsWith(".")) {
          continue;
        }

        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Check if directory should be excluded
          if (this.shouldExcludeDirectory(fullPath, excludePatterns)) {
            continue;
          }

          // Recursively scan subdirectory
          const subFiles = await this.scanDirectory(
            fullPath,
            pattern,
            excludePatterns,
            maxDepth,
            followSymlinks,
            includeHidden,
            currentDepth + 1
          );
          files.push(...subFiles);
        } else if (stats.isFile()) {
          // Check if file matches pattern and is not excluded
          if (this.matchesPattern(fullPath, pattern) && !this.shouldExcludeFile(fullPath, excludePatterns)) {
            const fileInfo: FileInfo = {
              path: fullPath,
              name: entry,
              size: stats.size,
              modified: stats.mtime,
              readable: true
            };
            files.push(fileInfo);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`⚠️  Failed to scan directory ${dir}: ${error}`);
    }

    return files;
  }

  /**
   * Check if directory should be excluded
   */
  private shouldExcludeDirectory(dirPath: string, excludePatterns: string[]): boolean {
    return excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
      return regex.test(dirPath);
    });
  }

  /**
   * Check if file should be excluded
   */
  private shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
    return excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
      return regex.test(filePath);
    });
  }

  /**
   * Check if file matches pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
    return regex.test(filePath);
  }

  /**
   * Get file type from extension
   */
  private getFileType(fileName: string): string {
    const extension = extname(fileName).toLowerCase();
    const language = this.languageMap.get(extension);
    return language?.name || "unknown";
  }

  /**
   * Check if file is binary
   */
  private async isBinaryFile(filePath: string): Promise<boolean> {
    try {
      const buffer = await readFile(filePath);
      // Check for null bytes or high ratio of non-printable characters
      const nullIndex = buffer.indexOf(0);
      if (nullIndex !== -1) {
        return true;
      }

      const printableChars = buffer.filter(byte => byte >= 32 && byte <= 126).length;
      const ratio = printableChars / buffer.length;
      return ratio < 0.7;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove duplicate files
   */
  private removeDuplicates(files: FileInfo[]): FileInfo[] {
    const seen = new Set<string>();
    return files.filter(file => {
      if (seen.has(file.path)) {
        return false;
      }
      seen.add(file.path);
      return true;
    });
  }

  /**
   * Initialize language mapping
   */
  private initializeLanguageMap(): void {
    const languages: LanguageInfo[] = [
      // Programming languages
      { name: "TypeScript", extensions: [".ts", ".tsx"], mimeTypes: ["text/typescript"], category: "programming" },
      { name: "JavaScript", extensions: [".js", ".jsx", ".mjs", ".cjs"], mimeTypes: ["text/javascript"], category: "programming" },
      { name: "Python", extensions: [".py", ".pyi", ".pyc"], mimeTypes: ["text/x-python"], category: "programming" },
      { name: "Java", extensions: [".java"], mimeTypes: ["text/x-java"], category: "programming" },
      { name: "C++", extensions: [".cpp", ".cc", ".cxx", ".hpp", ".h"], mimeTypes: ["text/x-c++"], category: "programming" },
      { name: "C#", extensions: [".cs"], mimeTypes: ["text/x-csharp"], category: "programming" },
      { name: "Go", extensions: [".go"], mimeTypes: ["text/x-go"], category: "programming" },
      { name: "Rust", extensions: [".rs"], mimeTypes: ["text/x-rust"], category: "programming" },
      { name: "PHP", extensions: [".php"], mimeTypes: ["text/x-php"], category: "programming" },
      { name: "Ruby", extensions: [".rb"], mimeTypes: ["text/x-ruby"], category: "programming" },
      { name: "Swift", extensions: [".swift"], mimeTypes: ["text/x-swift"], category: "programming" },
      { name: "Kotlin", extensions: [".kt", ".kts"], mimeTypes: ["text/x-kotlin"], category: "programming" },
      { name: "Scala", extensions: [".scala"], mimeTypes: ["text/x-scala"], category: "programming" },
      { name: "Dart", extensions: [".dart"], mimeTypes: ["text/x-dart"], category: "programming" },
      { name: "R", extensions: [".r", ".R"], mimeTypes: ["text/x-r"], category: "programming" },
      { name: "MATLAB", extensions: [".m"], mimeTypes: ["text/x-matlab"], category: "programming" },
      { name: "Shell", extensions: [".sh", ".bash", ".zsh", ".fish"], mimeTypes: ["text/x-shellscript"], category: "programming" },
      { name: "PowerShell", extensions: [".ps1", ".psm1"], mimeTypes: ["text/x-powershell"], category: "programming" },
      { name: "Batch", extensions: [".bat", ".cmd"], mimeTypes: ["text/x-msdos-batch"], category: "programming" },

      // Markup languages
      { name: "HTML", extensions: [".html", ".htm"], mimeTypes: ["text/html"], category: "markup" },
      { name: "XML", extensions: [".xml"], mimeTypes: ["text/xml"], category: "markup" },
      { name: "YAML", extensions: [".yml", ".yaml"], mimeTypes: ["text/yaml"], category: "markup" },
      { name: "TOML", extensions: [".toml"], mimeTypes: ["text/x-toml"], category: "markup" },
      { name: "Markdown", extensions: [".md", ".markdown"], mimeTypes: ["text/markdown"], category: "markup" },
      { name: "JSON", extensions: [".json"], mimeTypes: ["application/json"], category: "data" },
      { name: "CSV", extensions: [".csv"], mimeTypes: ["text/csv"], category: "data" },
      { name: "TSV", extensions: [".tsv"], mimeTypes: ["text/tab-separated-values"], category: "data" },

      // Styling
      { name: "CSS", extensions: [".css"], mimeTypes: ["text/css"], category: "markup" },
      { name: "SCSS", extensions: [".scss"], mimeTypes: ["text/x-scss"], category: "markup" },
      { name: "Sass", extensions: [".sass"], mimeTypes: ["text/x-sass"], category: "markup" },
      { name: "Less", extensions: [".less"], mimeTypes: ["text/x-less"], category: "markup" },

      // Configuration
      { name: "Dockerfile", extensions: ["Dockerfile", ".dockerfile"], mimeTypes: ["text/x-dockerfile"], category: "config" },
      { name: "Makefile", extensions: ["Makefile", "makefile"], mimeTypes: ["text/x-makefile"], category: "config" },
      { name: "Gitignore", extensions: [".gitignore"], mimeTypes: ["text/x-gitignore"], category: "config" },
      { name: "ESLint", extensions: [".eslintrc", ".eslintrc.js", ".eslintrc.json"], mimeTypes: ["application/json"], category: "config" },
      { name: "Prettier", extensions: [".prettierrc", ".prettierrc.js", ".prettierrc.json"], mimeTypes: ["application/json"], category: "config" },
      { name: "TypeScript Config", extensions: ["tsconfig.json"], mimeTypes: ["application/json"], category: "config" },
      { name: "Package.json", extensions: ["package.json"], mimeTypes: ["application/json"], category: "config" }
    ];

    for (const language of languages) {
      for (const extension of language.extensions) {
        this.languageMap.set(extension, language);
      }
    }
  }
}
