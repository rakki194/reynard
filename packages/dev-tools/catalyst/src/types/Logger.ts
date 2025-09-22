/**
 * ⚗️ Catalyst Logger Types
 * Type definitions for the unified logging system
 */

export interface ColorConfig {
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  reset: string;
  bold: string;
}

export interface Logger {
  log(message: string, color?: keyof ColorConfig): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
  debug(message: string): void;
  section(title: string): void;
  header(title: string): void;
  verbose(message: string): void;
}

export interface LoggerOptions {
  verbose?: boolean;
  colors?: Partial<ColorConfig>;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug' | 'verbose';
