/**
 * Logger Interface
 *
 * Provides structured logging capabilities for search operations
 * with different log levels and contextual information.
 */

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export interface LogContext {
  operation: string;
  query?: string;
  options?: Record<string, unknown>;
  duration?: number;
  resultCount?: number;
  error?: Error;
  [key: string]: unknown;
}

/**
 * Console Logger Implementation
 */
export class ConsoleLogger implements Logger {
  private formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext = error ? { ...context, error: error.message, stack: error.stack } : context;
    console.error(this.formatMessage("error", message, errorContext));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.debug(this.formatMessage("debug", message, context));
  }
}

/**
 * Silent Logger Implementation (for testing)
 */
export class SilentLogger implements Logger {
  info(_message: string, _context?: Record<string, unknown>): void {}
  warn(_message: string, _context?: Record<string, unknown>): void {}
  error(_message: string, _error?: Error, _context?: Record<string, unknown>): void {}
  debug(_message: string, _context?: Record<string, unknown>): void {}
}
