/**
 * 🦊 Dev Server Management CLI - Command Types
 *
 * Shared types and interfaces for CLI commands.
 */

export interface GlobalOptions {
  config: string;
  verbose: boolean;
  color: boolean;
}

export interface StartOptions {
  port?: string;
  detached?: boolean;
  healthCheck?: boolean;
}

export interface StopOptions {
  force?: boolean;
}

export interface StatusOptions {
  json?: boolean;
  health?: boolean;
}

export interface ListOptions {
  category?: string;
  json?: boolean;
}

export interface StopAllOptions {
  force?: boolean;
}

export interface HealthOptions {
  json?: boolean;
  watch?: boolean;
}

export interface ConfigOptions {
  validate?: boolean;
  migrate?: string;
}

export interface StatsOptions {
  json?: boolean;
}
