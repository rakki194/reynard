#!/usr/bin/env node
/**
 * Shared File System Utilities for Reynard Validation Scripts
 *
 * Provides common file operations, git integration, and path utilities
 * used across all validation tools.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Colors, printColored } from "./colors.js";

/**
 * Default ignore patterns for file discovery
 */
export const DEFAULT_IGNORE_PATTERNS = [
  /node_modules/,
  /dist/,
  /build/,
  /\.git/,
  /coverage/,
  /htmlcov/,
  /__pycache__/,
  /\.venv/,
  /venv/,
  /third_party/,
  /\.husky\/node_modules/,
  /\.next/,
  /\.cache/,
];

/**
 * Get staged files from git
 * @param {string[]} extensions - File extensions to filter (e.g., ['.md', '.js'])
 * @returns {string[]} Array of staged file paths
 */
export function getStagedFiles(extensions = []) {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf8",
    });

    const allFiles = output
      .trim()
      .split("\n")
      .filter(f => f);

    if (extensions.length === 0) {
      return allFiles;
    }

    return allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    });
  } catch (error) {
    printColored(`Error getting staged files: ${error.message}`, Colors.RED);
    return [];
  }
}

/**
 * Get all files matching extensions in the project
 * @param {string[]} extensions - File extensions to find (e.g., ['.md', '.js'])
 * @param {string[]} excludePaths - Additional paths to exclude
 * @returns {string[]} Array of file paths
 */
export function getAllFiles(extensions, excludePaths = []) {
  try {
    const excludePatterns = [
      "./node_modules/*",
      "./.git/*",
      "./third_party/*",
      "./backend/venv/*",
      "./packages/*/node_modules/*",
      "./examples/*/node_modules/*",
      "./templates/*/node_modules/*",
      ...excludePaths,
    ];

    const excludeArgs = excludePatterns.map(pattern => `-not -path "${pattern}"`).join(" ");
    const extArgs = extensions.map(ext => `-name "*${ext}"`).join(" -o ");

    const command = `find . \\( ${extArgs} \\) ${excludeArgs}`;
    const output = execSync(command, { encoding: "utf8" });

    return output
      .trim()
      .split("\n")
      .filter(f => f)
      .map(f => f.trim());
  } catch (error) {
    printColored(`Error getting all files: ${error.message}`, Colors.RED);
    return [];
  }
}

/**
 * Get staged markdown files
 * @returns {string[]} Array of staged markdown file paths
 */
export function getStagedMarkdownFiles() {
  return getStagedFiles([".md", ".markdown", ".mdown", ".mkdn", ".mkd"]);
}

/**
 * Get all markdown files in the project
 * @returns {string[]} Array of markdown file paths
 */
export function getAllMarkdownFiles() {
  return getAllFiles([".md", ".markdown", ".mdown", ".mkdn", ".mkd"]);
}

/**
 * Check if a directory should be excluded based on ignore patterns
 * @param {string} dirPath - Directory path to check
 * @param {RegExp[]} ignorePatterns - Patterns to check against
 * @returns {boolean} True if directory should be excluded
 */
export function shouldExcludeDirectory(dirPath, ignorePatterns = DEFAULT_IGNORE_PATTERNS) {
  return ignorePatterns.some(pattern => pattern.test(dirPath));
}

/**
 * Recursively scan directory for files with specific extensions
 * @param {string} dirPath - Directory to scan
 * @param {string[]} extensions - File extensions to include
 * @param {RegExp[]} ignorePatterns - Patterns to exclude
 * @returns {string[]} Array of found file paths
 */
export function scanDirectory(dirPath, extensions, ignorePatterns = DEFAULT_IGNORE_PATTERNS) {
  const files = [];

  if (shouldExcludeDirectory(dirPath, ignorePatterns)) {
    return files;
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath, extensions, ignorePatterns));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    printColored(`Warning: Could not scan directory ${dirPath}: ${error.message}`, Colors.YELLOW);
  }

  return files;
}

/**
 * Find project root directory (where package.json is located)
 * @returns {string} Project root path
 */
export function findProjectRoot() {
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
 * Resolve relative path from a base file
 * @param {string} relativePath - Relative path to resolve
 * @param {string} baseFile - Base file path
 * @returns {string} Resolved absolute path
 */
export function resolveRelativePath(relativePath, baseFile) {
  const baseDir = path.dirname(baseFile);
  return path.resolve(baseDir, relativePath);
}

/**
 * Check if file exists and is readable
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file exists and is readable
 */
export function isFileReadable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely read file content
 * @param {string} filePath - File path to read
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {string|null} File content or null if error
 */
export function safeReadFile(filePath, encoding = "utf8") {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    printColored(`Error reading file ${filePath}: ${error.message}`, Colors.RED);
    return null;
  }
}

/**
 * Safely write file content
 * @param {string} filePath - File path to write
 * @param {string} content - Content to write
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {boolean} True if successful
 */
export function safeWriteFile(filePath, content, encoding = "utf8") {
  try {
    fs.writeFileSync(filePath, content, encoding);
    return true;
  } catch (error) {
    printColored(`Error writing file ${filePath}: ${error.message}`, Colors.RED);
    return false;
  }
}

/**
 * Get file extension (lowercase)
 * @param {string} filePath - File path
 * @returns {string} File extension including dot
 */
export function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * Get relative path from project root
 * @param {string} filePath - File path
 * @param {string} projectRoot - Project root path
 * @returns {string} Relative path
 */
export function getRelativePath(filePath, projectRoot = null) {
  const root = projectRoot || findProjectRoot();
  return path.relative(root, filePath);
}

export default {
  getStagedFiles,
  getAllFiles,
  getStagedMarkdownFiles,
  getAllMarkdownFiles,
  shouldExcludeDirectory,
  scanDirectory,
  findProjectRoot,
  resolveRelativePath,
  isFileReadable,
  safeReadFile,
  safeWriteFile,
  getFileExtension,
  getRelativePath,
  DEFAULT_IGNORE_PATTERNS,
};
