/**
 * 🦊 Reynard Animation Logger
 *
 * Centralized logging system for the animation package with configurable levels
 * and production-safe defaults.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableProduction: boolean;
  prefix: string;
}

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;

  private constructor() {
    this.config = {
      level: "WARN", // Default to WARN in production
      enableConsole: false, // Disabled by default
      enableProduction: false, // Disabled in production builds
      prefix: "🦊 Animation",
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("DEBUG")) {
      this.log("DEBUG", message, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("INFO")) {
      this.log("INFO", message, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("WARN")) {
      this.log("WARN", message, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.shouldLog("ERROR")) {
      this.log("ERROR", message, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableConsole) return false;
    if (!this.config.enableProduction && this.isProduction()) return false;

    const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${this.config.prefix} [${level}]: ${message}`;

    switch (level) {
      case "DEBUG":
        console.debug(logMessage, ...args);
        break;
      case "INFO":
        console.info(logMessage, ...args);
        break;
      case "WARN":
        console.warn(logMessage, ...args);
        break;
      case "ERROR":
        console.error(logMessage, ...args);
        break;
    }
  }

  private isProduction(): boolean {
    return (
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "prod" ||
      (typeof window !== "undefined" && window.location.hostname !== "localhost")
    );
  }

  // Convenience methods for common patterns
  public performance(name: string, duration: number, iterations?: number): void {
    if (this.shouldLog("INFO")) {
      const message = iterations
        ? `${name}: ${duration.toFixed(2)}ms (${iterations} iterations)`
        : `${name}: ${duration.toFixed(2)}ms`;
      this.info(message);
    }
  }

  public packageImport(packageName: string, duration: number, success: boolean): void {
    if (this.shouldLog("DEBUG")) {
      const status = success ? "successfully imported" : "failed to import";
      this.debug(`Package ${packageName} ${status} (${duration.toFixed(2)}ms)`);
    }
  }

  public animationEvent(event: string, data?: unknown): void {
    if (this.shouldLog("DEBUG")) {
      this.debug(`Animation event: ${event}`, data);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
  debug: (message: string, ...args: unknown[]) => logger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(message, ...args),
  performance: (name: string, duration: number, iterations?: number) => logger.performance(name, duration, iterations),
  packageImport: (packageName: string, duration: number, success: boolean) =>
    logger.packageImport(packageName, duration, success),
  animationEvent: (event: string, data?: unknown) => logger.animationEvent(event, data),
};

// Development helper - only available in development
export const enableDebugLogging = (): void => {
  if (process.env.NODE_ENV !== "production") {
    logger.configure({
      level: "DEBUG",
      enableConsole: true,
      enableProduction: false,
    });
  }
};

// Production helper - enables minimal logging for errors only
export const enableProductionLogging = (): void => {
  logger.configure({
    level: "ERROR",
    enableConsole: true,
    enableProduction: true,
  });
};
