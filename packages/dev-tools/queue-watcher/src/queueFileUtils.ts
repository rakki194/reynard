/**
 * 🦊 Reynard Queue Watcher File Utilities
 *
 * Enhanced file utilities using catalyst for consistent file operations.
 */

import path from "path";
import { FileTypeDetector, FileExclusionManager } from "reynard-dev-tools-catalyst";
import { EXCLUDE_PATTERNS } from "./config.js";

/**
 * Get common junk file patterns
 * @returns Array of regex patterns for junk files
 */
function getJunkPatterns(): RegExp[] {
  return [
    /\.pyc$/,
    /\.pyo$/,
    /\.pyd$/,
    /\.so$/,
    /\.dylib$/,
    /\.dll$/,
    /\.exe$/,
    /\.cache$/,
    /\.tmp$/,
    /\.temp$/,
    /\.log$/,
    /\.pid$/,
    /\.lock$/,
    /\.swp$/,
    /\.swo$/,
    /~$/,
    /\.DS_Store$/,
    /Thumbs\.db$/,
    /\.mypy_cache/,
    /__pycache__/,
    /\.pytest_cache/,
    /\.tox/,
    /\.coverage/,
    /\.eggs/,
    /\.eggs-info/,
    /reynard.*\.egg-info/,
    /test-results/,
    /playwright-report/,
    /dombench-results/,
    /results/,
    /\.tsbuildinfo$/,
    /pnpm-lock\.yaml$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /\.env$/,
    /\.env\..*$/,
    /\.git/,
    /\.vscode/,
  ];
}

/**
 * Check if a file path should be excluded from processing
 * @param filePath - Path to the file
 * @returns True if the file should be excluded
 */
export function shouldExcludeFile(filePath: string): boolean {
  const normalizedPath = path.resolve(filePath);

  // Use catalyst exclusion manager for standard patterns
  if (FileExclusionManager.shouldExcludeFile(normalizedPath)) {
    console.log(`🚫 Excluded by catalyst pattern: ${normalizedPath}`);
    return true;
  }

  // Check against local exclusion patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      console.log(`🚫 Excluded by pattern: ${normalizedPath}`);
      return true;
    }
  }

  // Check if file is in a dist folder (case-insensitive)
  const pathParts = normalizedPath.split(path.sep);
  for (const part of pathParts) {
    if (part.toLowerCase() === "dist") {
      console.log(`🚫 Excluded by dist folder: ${normalizedPath}`);
      return true;
    }
  }

  // Additional checks for common junk files
  const junkPatterns = getJunkPatterns();
  for (const junkPattern of junkPatterns) {
    if (junkPattern.test(normalizedPath)) {
      console.log(`🚫 Excluded by junk pattern: ${normalizedPath}`);
      return true;
    }
  }

  return false;
}

/**
 * Check if a file was recently processed to avoid excessive runs
 * @param filePath - Path to the file
 * @param recentlyProcessed - Map of recently processed files
 * @param cooldown - Cooldown period in milliseconds
 * @returns True if the file was recently processed
 */
export function wasRecentlyProcessed(
  filePath: string,
  recentlyProcessed: Map<string, number>,
  cooldown: number
): boolean {
  const now = Date.now();
  const lastProcessed = recentlyProcessed.get(filePath);

  if (lastProcessed && now - lastProcessed < cooldown) {
    return true;
  }

  recentlyProcessed.set(filePath, now);
  return false;
}

/**
 * Get file type based on extension using catalyst FileTypeDetector
 * @param filePath - Path to the file
 * @returns File type or null if not supported
 */
export function getFileType(filePath: string): string | null {
  // Use catalyst FileTypeDetector for consistent file type detection
  const catalystType = FileTypeDetector.getFileType(filePath);

  if (catalystType) {
    return catalystType;
  }

  // Fallback to local detection for queue-watcher specific types
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".md":
    case ".mdx":
      return "markdown";
    case ".ts":
    case ".tsx":
      return "typescript";
    case ".js":
    case ".jsx":
      return "javascript";
    case ".py":
      return "python";
    case ".json":
      return "json";
    case ".yaml":
    case ".yml":
      return "yaml";
    case ".css":
      return "css";
    case ".html":
    case ".htm":
      return "html";
    default:
      return null;
  }
}
