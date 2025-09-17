/**
 * 🦊 Reynard Project Architecture Utilities
 *
 * Utility functions for working with the project architecture system.
 */

import path from "path";
import fs from "fs";
import { 
  REYNARD_ARCHITECTURE, 
  getWatchableDirectories, 
  getBuildableDirectories, 
  getTestableDirectories, 
  getLintableDirectories, 
  getDocumentableDirectories,
  getGlobalExcludePatterns,
  getGlobalIncludePatterns
} from "./architecture.js";
import type { 
  DirectoryDefinition, 
  DirectoryQueryResult, 
  PathResolutionOptions, 
  DirectoryCategory, 
  ImportanceLevel 
} from "./types.js";

/**
 * Resolve a relative path to absolute path
 */
export function resolvePath(relativePath: string, rootPath?: string): string {
  const root = rootPath || REYNARD_ARCHITECTURE.rootPath;
  return path.resolve(root, relativePath);
}

/**
 * Check if a directory exists
 */
export function directoryExists(dirPath: string, rootPath?: string): boolean {
  const absolutePath = resolvePath(dirPath, rootPath);
  return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory();
}

/**
 * Get directory definition by name
 */
export function getDirectoryDefinition(name: string): DirectoryDefinition | undefined {
  return REYNARD_ARCHITECTURE.directories.find(dir => dir.name === name);
}

/**
 * Get directory definition by path
 */
export function getDirectoryDefinitionByPath(dirPath: string): DirectoryDefinition | undefined {
  return REYNARD_ARCHITECTURE.directories.find(dir => dir.path === dirPath);
}

/**
 * Query directories with filters
 */
export function queryDirectories(options: PathResolutionOptions = {}): DirectoryQueryResult {
  const startTime = Date.now();
  
  let directories = [...REYNARD_ARCHITECTURE.directories];
  
  // Apply filters
  if (options.category) {
    directories = directories.filter(dir => dir.category === options.category);
  }
  
  if (options.importance) {
    directories = directories.filter(dir => dir.importance === options.importance);
  }
  
  if (options.watchable !== undefined) {
    directories = directories.filter(dir => dir.watchable === options.watchable);
  }
  
  if (options.buildable !== undefined) {
    directories = directories.filter(dir => dir.buildable === options.buildable);
  }
  
  if (options.testable !== undefined) {
    directories = directories.filter(dir => dir.testable === options.testable);
  }
  
  if (options.lintable !== undefined) {
    directories = directories.filter(dir => dir.lintable === options.lintable);
  }
  
  if (options.documentable !== undefined) {
    directories = directories.filter(dir => dir.documentable === options.documentable);
  }
  
  if (options.includeOptional === false) {
    directories = directories.filter(dir => !dir.optional);
  }
  
  if (options.includeGenerated === false) {
    directories = directories.filter(dir => !dir.generated);
  }
  
  if (options.includeThirdParty === false) {
    directories = directories.filter(dir => !dir.thirdParty);
  }
  
  // Resolve paths if requested
  if (options.absolute) {
    directories = directories.map(dir => ({
      ...dir,
      path: resolvePath(dir.path)
    }));
  }
  
  const executionTime = Date.now() - startTime;
  
  return {
    directories,
    count: directories.length,
    executionTime
  };
}

/**
 * Get all directory paths with options
 */
export function getDirectoryPaths(options: PathResolutionOptions = {}): string[] {
  const result = queryDirectories(options);
  return result.directories.map(dir => dir.path);
}

/**
 * Get directories by category
 */
export function getDirectoriesByCategory(category: DirectoryCategory): DirectoryDefinition[] {
  return REYNARD_ARCHITECTURE.directories.filter(dir => dir.category === category);
}

/**
 * Get directories by importance level
 */
export function getDirectoriesByImportance(importance: ImportanceLevel): DirectoryDefinition[] {
  return REYNARD_ARCHITECTURE.directories.filter(dir => dir.importance === importance);
}

/**
 * Get related directories
 */
export function getRelatedDirectories(directoryName: string, relationshipType?: string): DirectoryDefinition[] {
  const directory = getDirectoryDefinition(directoryName);
  if (!directory) {
    return [];
  }
  
  const relatedNames = directory.relationships
    .filter(rel => !relationshipType || rel.type === relationshipType)
    .map(rel => rel.directory);
  
  return relatedNames
    .map(name => getDirectoryDefinition(name))
    .filter((dir): dir is DirectoryDefinition => dir !== undefined);
}

/**
 * Check if a file path should be excluded
 */
export function shouldExcludeFile(filePath: string, directoryName?: string): boolean {
  const globalPatterns = getGlobalExcludePatterns();
  
  // Check global patterns
  for (const pattern of globalPatterns) {
    if (matchesPattern(filePath, pattern)) {
      return true;
    }
  }
  
  // Check directory-specific patterns
  if (directoryName) {
    const directory = getDirectoryDefinition(directoryName);
    if (directory) {
      for (const pattern of directory.excludePatterns) {
        if (matchesPattern(filePath, pattern)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Check if a file path should be included
 */
export function shouldIncludeFile(filePath: string, directoryName?: string): boolean {
  // First check if file should be excluded
  if (shouldExcludeFile(filePath, directoryName)) {
    return false;
  }
  
  const globalPatterns = getGlobalIncludePatterns();
  
  // Check global patterns first
  let matchesGlobal = false;
  for (const pattern of globalPatterns) {
    if (matchesPattern(filePath, pattern)) {
      matchesGlobal = true;
      break;
    }
  }
  
  if (!matchesGlobal) {
    return false;
  }
  
  // Check directory-specific patterns
  if (directoryName) {
    const directory = getDirectoryDefinition(directoryName);
    if (directory && directory.includePatterns.length > 0) {
      for (const pattern of directory.includePatterns) {
        if (matchesPattern(filePath, pattern)) {
          return true;
        }
      }
      return false; // Directory has specific patterns and file doesn't match any
    }
  }
  
  return true;
}

/**
 * Simple pattern matching (supports ** and * wildcards)
 */
function matchesPattern(filePath: string, pattern: string): boolean {
  // Simple string matching for common patterns
  if (pattern === '**/node_modules/**') {
    return filePath.includes('node_modules/');
  }
  if (pattern === '**/dist/**') {
    return filePath.includes('dist/');
  }
  if (pattern === '**/build/**') {
    return filePath.includes('build/');
  }
  if (pattern === '**/coverage/**') {
    return filePath.includes('coverage/');
  }
  if (pattern === '**/.git/**') {
    return filePath.includes('.git/');
  }
  if (pattern === '**/.vscode/**') {
    return filePath.includes('.vscode/');
  }
  if (pattern === '**/third_party/**') {
    return filePath.includes('third_party/');
  }
  
  // For include patterns
  if (pattern === '**/*.ts') {
    return filePath.endsWith('.ts');
  }
  if (pattern === '**/*.tsx') {
    return filePath.endsWith('.tsx');
  }
  if (pattern === '**/*.js') {
    return filePath.endsWith('.js');
  }
  if (pattern === '**/*.jsx') {
    return filePath.endsWith('.jsx');
  }
  if (pattern === '**/*.py') {
    return filePath.endsWith('.py');
  }
  if (pattern === '**/*.md') {
    return filePath.endsWith('.md');
  }
  if (pattern === '**/*.json') {
    return filePath.endsWith('.json');
  }
  if (pattern === '**/*.yaml') {
    return filePath.endsWith('.yaml');
  }
  if (pattern === '**/*.yml') {
    return filePath.endsWith('.yml');
  }
  if (pattern === '**/*.css') {
    return filePath.endsWith('.css');
  }
  if (pattern === '**/*.html') {
    return filePath.endsWith('.html');
  }
  if (pattern === '**/*.htm') {
    return filePath.endsWith('.htm');
  }
  if (pattern === '**/*.sh') {
    return filePath.endsWith('.sh');
  }
  if (pattern === '**/*.sql') {
    return filePath.endsWith('.sql');
  }
  if (pattern === '**/*.conf') {
    return filePath.endsWith('.conf');
  }
  
  // Fallback to simple string matching
  return filePath.includes(pattern.replace(/\*\*/g, ''));
}

/**
 * Get file type from extension
 */
export function getFileTypeFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
      return 'javascript';
    case '.py':
      return 'python';
    case '.md':
    case '.mdx':
      return 'markdown';
    case '.json':
      return 'json';
    case '.yaml':
    case '.yml':
      return 'yaml';
    case '.css':
      return 'css';
    case '.html':
    case '.htm':
      return 'html';
    case '.sh':
      return 'shell';
    case '.sql':
      return 'sql';
    case '.conf':
      return 'config';
    default:
      return 'other';
  }
}

/**
 * Get directory that contains a file path
 */
export function getDirectoryForFilePath(filePath: string): DirectoryDefinition | undefined {
  const normalizedPath = path.normalize(filePath);
  
  // Find the directory that best matches this path
  let bestMatch: DirectoryDefinition | undefined;
  let bestMatchLength = 0;
  
  for (const directory of REYNARD_ARCHITECTURE.directories) {
    if (normalizedPath.startsWith(directory.path) && directory.path.length > bestMatchLength) {
      bestMatch = directory;
      bestMatchLength = directory.path.length;
    }
  }
  
  return bestMatch;
}

/**
 * Validate project structure
 */
export function validateProjectStructure(rootPath?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const root = rootPath || REYNARD_ARCHITECTURE.rootPath;
  
  for (const directory of REYNARD_ARCHITECTURE.directories) {
    if (!directory.optional && !directoryExists(directory.path, root)) {
      errors.push(`Required directory missing: ${directory.path}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate project structure report
 */
export function generateProjectStructureReport(rootPath?: string): string {
  const root = rootPath || REYNARD_ARCHITECTURE.rootPath;
  const validation = validateProjectStructure(root);
  
  let report = `# 🦊 Reynard Project Structure Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Root Path:** ${root}\n`;
  report += `**Status:** ${validation.valid ? '✅ Valid' : '❌ Issues Found'}\n\n`;
  
  if (!validation.valid) {
    report += `## Issues\n\n`;
    for (const error of validation.errors) {
      report += `- ❌ ${error}\n`;
    }
    report += `\n`;
  }
  
  report += `## Directory Summary\n\n`;
  report += `| Name | Category | Importance | Watchable | Buildable | Testable | Lintable |\n`;
  report += `|------|----------|------------|-----------|-----------|----------|----------|\n`;
  
  for (const directory of REYNARD_ARCHITECTURE.directories) {
    report += `| ${directory.name} | ${directory.category} | ${directory.importance} | ${directory.watchable ? '✅' : '❌'} | ${directory.buildable ? '✅' : '❌'} | ${directory.testable ? '✅' : '❌'} | ${directory.lintable ? '✅' : '❌'} |\n`;
  }
  
  report += `\n## Quick Access\n\n`;
  report += `- **Watchable Directories:** ${getWatchableDirectories().length}\n`;
  report += `- **Buildable Directories:** ${getBuildableDirectories().length}\n`;
  report += `- **Testable Directories:** ${getTestableDirectories().length}\n`;
  report += `- **Lintable Directories:** ${getLintableDirectories().length}\n`;
  report += `- **Documentable Directories:** ${getDocumentableDirectories().length}\n`;
  
  return report;
}
