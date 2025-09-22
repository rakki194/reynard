/**
 * ⚗️ Catalyst CLI Types
 * Type definitions for the unified CLI system
 */

export interface CLIOptions {
  verbose?: boolean;
  backup?: boolean;
  validate?: boolean;
  output?: string;
}

export interface BaseCLIConfig {
  name: string;
  description: string;
  version: string;
  options?: CLIOptions;
}

export interface CLICommand {
  name: string;
  description: string;
  options?: Record<string, any>;
  action: (options: any) => Promise<void> | void;
}

export interface BackupOptions {
  filePath: string;
  backupDir?: string;
  timestamp?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}
