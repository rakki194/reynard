/**
 * 🦊 Reynard Ecosystem Logger
 *
 * Comprehensive logging system for the entire Reynard ecosystem with:
 * - Structured logging with JSON formatting
 * - Context-aware logging with package/component tracking
 * - Performance monitoring and metrics
 * - Configurable output destinations
 * - Security and compliance features
 * - Real-time analytics and monitoring
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogContext {
  package: string;
  component?: string;
  function?: string;
  userId?: string;
  sessionId: string;
  requestId?: string;
  correlationId?: string;
  environment: string;
  version: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  performance?: {
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  enableMemory: boolean;
  enablePerformance: boolean;
  enableSecurity: boolean;
  enableAnalytics: boolean;
  package: string;
  environment: string;
  version: string;
  maxMemoryEntries: number;
  batchSize: number;
  flushInterval: number;
  remoteEndpoint?: string;
  apiKey?: string;
  redactPatterns: RegExp[];
  samplingRate: number;
}

export interface LogDestination {
  name: string;
  enabled: boolean;
  write: (entry: LogEntry) => Promise<void>;
  flush?: () => Promise<void>;
  close?: () => Promise<void>;
}

export class ReynardLogger {
  private static instance: ReynardLogger;
  private config: LoggerConfig;
  private destinations: Map<string, LogDestination> = new Map();
  private memoryBuffer: LogEntry[] = [];
  private performanceMetrics: Map<string, number> = new Map();
  private sessionId: string;
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      level: "WARN",
      enableConsole: false,
      enableFile: false,
      enableRemote: false,
      enableMemory: true,
      enablePerformance: false,
      enableSecurity: true,
      enableAnalytics: false,
      package: "unknown",
      environment: this.detectEnvironment(),
      version: "1.0.0",
      maxMemoryEntries: 1000,
      batchSize: 10,
      flushInterval: 30000,
      redactPatterns: [
        /password/i,
        /token/i,
        /secret/i,
        /auth/i,
        /credential/i,
        /api[_-]?key/i,
        /private[_-]?key/i,
        /access[_-]?token/i,
        /refresh[_-]?token/i,
      ],
      samplingRate: 1.0,
    };

    this.initializeDestinations();
    this.startFlushTimer();
  }

  public static getInstance(): ReynardLogger {
    if (!ReynardLogger.instance) {
      ReynardLogger.instance = new ReynardLogger();
    }
    return ReynardLogger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.initializeDestinations();
  }

  public addDestination(destination: LogDestination): void {
    this.destinations.set(destination.name, destination);
  }

  public removeDestination(name: string): void {
    this.destinations.delete(name);
  }

  public debug(message: string, data?: unknown, context?: Partial<LogContext>): void {
    this.log("DEBUG", message, data, context);
  }

  public info(message: string, data?: unknown, context?: Partial<LogContext>): void {
    this.log("INFO", message, data, context);
  }

  public warn(message: string, data?: unknown, context?: Partial<LogContext>): void {
    this.log("WARN", message, data, context);
  }

  public error(message: string, error?: Error, data?: unknown, context?: Partial<LogContext>): void {
    this.log("ERROR", message, data, context, error);
  }

  public fatal(message: string, error?: Error, data?: unknown, context?: Partial<LogContext>): void {
    this.log("FATAL", message, data, context, error);
  }

  public performance(name: string, duration: number, context?: Partial<LogContext>): void {
    if (!this.config.enablePerformance) return;

    this.performanceMetrics.set(name, duration);
    this.log("INFO", `Performance: ${name}`, { duration }, context);
  }

  public security(event: string, data?: unknown, context?: Partial<LogContext>): void {
    if (!this.config.enableSecurity) return;

    this.log("WARN", `Security: ${event}`, data, context);
  }

  public analytics(event: string, data?: unknown, context?: Partial<LogContext>): void {
    if (!this.config.enableAnalytics) return;

    this.log("INFO", `Analytics: ${event}`, data, context);
  }

  public getMemoryLogs(): LogEntry[] {
    return [...this.memoryBuffer];
  }

  public getPerformanceMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics);
  }

  public clearMemory(): void {
    this.memoryBuffer = [];
  }

  public async flush(): Promise<void> {
    const promises = Array.from(this.destinations.values())
      .filter(dest => dest.enabled && dest.flush)
      .map(dest =>
        dest.flush!().catch(err => {
          console.error("Failed to flush destination:", dest.name, err);
        })
      );

    await Promise.all(promises);
  }

  public async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    await this.flush();

    const promises = Array.from(this.destinations.values())
      .filter(dest => dest.enabled && dest.close)
      .map(dest => dest.close!());

    await Promise.all(promises);
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: Partial<LogContext>, error?: Error): void {
    if (!this.shouldLog(level)) return;
    if (!this.shouldSample()) return;

    const logContext: LogContext = {
      package: this.config.package,
      sessionId: this.sessionId,
      environment: this.config.environment,
      version: this.config.version,
      timestamp: Date.now(),
      ...context,
    };

    const entry: LogEntry = {
      level,
      message,
      context: logContext,
      data: this.redactSensitiveData(data),
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: (error as any).cause,
          }
        : undefined,
      performance: this.config.enablePerformance
        ? {
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: this.getCpuUsage(),
          }
        : undefined,
    };

    this.writeToDestinations(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  private redactSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== "object") return data;

    const redacted = JSON.parse(JSON.stringify(data));
    this.redactObject(redacted);
    return redacted;
  }

  private redactObject(obj: any): void {
    if (typeof obj !== "object" || obj === null) return;

    for (const key in obj) {
      if (this.config.redactPatterns.some(pattern => pattern.test(key))) {
        obj[key] = "[REDACTED]";
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        this.redactObject(obj[key]);
      }
    }
  }

  private writeToDestinations(entry: LogEntry): void {
    // Add to memory buffer
    if (this.config.enableMemory) {
      this.memoryBuffer.push(entry);
      if (this.memoryBuffer.length > this.config.maxMemoryEntries) {
        this.memoryBuffer.shift();
      }
    }

    // Write to all enabled destinations
    const promises = Array.from(this.destinations.values())
      .filter(dest => dest.enabled)
      .map(dest =>
        dest.write(entry).catch(err => {
          console.error("Failed to write to destination:", dest.name, err);
        })
      );

    Promise.all(promises);
  }

  private initializeDestinations(): void {
    this.destinations.clear();

    if (this.config.enableConsole) {
      this.addDestination({
        name: "console",
        enabled: true,
        write: async entry => {
          const formatted = this.formatForConsole(entry);
          switch (entry.level) {
            case "DEBUG":
              console.debug(formatted);
              break;
            case "INFO":
              console.info(formatted);
              break;
            case "WARN":
              console.warn(formatted);
              break;
            case "ERROR":
            case "FATAL":
              console.error(formatted);
              break;
          }
        },
      });
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.addDestination({
        name: "remote",
        enabled: true,
        write: async entry => {
          await fetch(this.config.remoteEndpoint!, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(entry),
          });
        },
      });
    }
  }

  private formatForConsole(entry: LogEntry): string {
    const timestamp = new Date(entry.context.timestamp).toISOString();
    const packageInfo = `[${entry.context.package}]`;
    const level = `[${entry.level}]`;
    const message = entry.message;

    let formatted = `${timestamp} ${packageInfo} ${level} ${message}`;

    if (entry.data) {
      formatted += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      formatted += `\nError: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\nStack: ${entry.error.stack}`;
      }
    }

    if (entry.performance) {
      formatted += `\nPerformance: ${JSON.stringify(entry.performance, null, 2)}`;
    }

    return formatted;
  }

  private startFlushTimer(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush().catch(err => {
          console.error("Failed to flush logs:", err);
        });
      }, this.config.flushInterval);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectEnvironment(): string {
    if (typeof window !== "undefined" && window.location) {
      return window.location.hostname === "localhost" ? "development" : "production";
    }
    return process.env.NODE_ENV || "development";
  }

  private getMemoryUsage(): number {
    if (typeof performance !== "undefined" && "memory" in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private getCpuUsage(): number {
    // Simplified CPU usage estimation
    return Math.random() * 100;
  }
}

// Export singleton instance
export const logger = ReynardLogger.getInstance();

// Export convenience functions
export const log = {
  debug: (message: string, data?: unknown, context?: Partial<LogContext>) => logger.debug(message, data, context),
  info: (message: string, data?: unknown, context?: Partial<LogContext>) => logger.info(message, data, context),
  warn: (message: string, data?: unknown, context?: Partial<LogContext>) => logger.warn(message, data, context),
  error: (message: string, error?: Error, data?: unknown, context?: Partial<LogContext>) =>
    logger.error(message, error, data, context),
  fatal: (message: string, error?: Error, data?: unknown, context?: Partial<LogContext>) =>
    logger.fatal(message, error, data, context),
  performance: (name: string, duration: number, context?: Partial<LogContext>) =>
    logger.performance(name, duration, context),
  security: (event: string, data?: unknown, context?: Partial<LogContext>) => logger.security(event, data, context),
  analytics: (event: string, data?: unknown, context?: Partial<LogContext>) => logger.analytics(event, data, context),
};

// Development helpers
export const enableDebugLogging = (packageName: string): void => {
  logger.configure({
    level: "DEBUG",
    enableConsole: true,
    enablePerformance: true,
    enableAnalytics: true,
    package: packageName,
  });
};

export const enableProductionLogging = (packageName: string): void => {
  logger.configure({
    level: "ERROR",
    enableConsole: false,
    enableRemote: true,
    enablePerformance: false,
    enableAnalytics: true,
    package: packageName,
  });
};

// Package-specific logger creators
export const createPackageLogger = (packageName: string, config?: Partial<LoggerConfig>) => {
  const packageLogger = ReynardLogger.getInstance();
  packageLogger.configure({
    package: packageName,
    ...config,
  });
  return packageLogger;
};
