/**
 * ⚗️ Catalyst File Utils Types
 * Type definitions for the unified file utilities system
 */

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  modified: Date;
  readable: boolean;
}

export interface FileTypeMapping {
  [extension: string]: string;
}

export interface ExclusionPattern {
  pattern: RegExp;
  description: string;
}

export interface FileManagerOptions {
  projectRoot?: string;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  verbose?: boolean;
}

export interface ScanOptions {
  extensions?: string[];
  recursive?: boolean;
  excludeDirs?: string[];
  includeDirs?: string[];
}

export interface BackupResult {
  success: boolean;
  backupPath?: string;
  error?: string;
}

export type FileType =
  | "typescript"
  | "javascript"
  | "python"
  | "markdown"
  | "json"
  | "yaml"
  | "css"
  | "html"
  | "shell"
  | "sql"
  | "config"
  | "toml"
  | "other";
