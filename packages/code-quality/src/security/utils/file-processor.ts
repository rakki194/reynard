/**
 * 🦊 Security File Processor
 *
 * *whiskers twitch with cunning* Utility functions for processing files
 * in security analysis context.
 */

import { extname } from "path";

/**
 * 🦊 Group files by language
 */
export function groupFilesByLanguage(files: string[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const file of files) {
    const language = detectLanguage(file);
    if (!grouped.has(language)) {
      grouped.set(language, []);
    }
    grouped.get(language)!.push(file);
  }

  return grouped;
}

/**
 * 🦊 Detect file language
 */
export function detectLanguage(file: string): string {
  const ext = extname(file);
  const languageMap: Record<string, string> = {
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".sh": "shell",
    ".md": "markdown",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".json": "json",
  };
  return languageMap[ext] || "unknown";
}

/**
 * 🦊 Get files relevant to a security tool
 */
export function getRelevantFiles(filesByLanguage: Map<string, string[]>, supportedLanguages: string[]): string[] {
  const relevantFiles: string[] = [];

  for (const language of supportedLanguages) {
    const files = filesByLanguage.get(language) || [];
    relevantFiles.push(...files);
  }

  return relevantFiles;
}
