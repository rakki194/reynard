/**
 * 🦊 Dev Server Management Type Definitions
 *
 * Comprehensive type definitions for the development server management system.
 * Leverages existing Reynard ecosystem patterns for consistency.
 */

import type { ServiceStatus, ServiceHealth } from "reynard-service-manager";
import type { QueueStatus, ProcessingResult } from "reynard-queue-watcher";

// ============================================================================
// Core Configuration Types
// ============================================================================

export interface ProjectConfig {
  /** Unique project identifier */
  name: string;
  /** Port number for the development server */
  port: number;
  /** Human-readable description */
  description: string;
  /** Project category for organization */
  category: ProjectCategory;
  /** Enable automatic reloading on file changes */
  autoReload: boolean;
  /** Enable hot module replacement */
  hotReload: boolean;
  /** Project dependencies (other projects that must start first) */
  dependencies?: string[];
  /** Health check configuration */
  healthCheck?: HealthCheckConfig;
  /** Environment variables for the project */
  env?: Record<string, string>;
  /** Working directory for the project */
  cwd?: string;
  /** Command to start the development server */
  command?: string;
  /** Arguments for the start command */
  args?: string[];
  /** Timeout for startup (in milliseconds) */
  startupTimeout?: number;
  /** Timeout for shutdown (in milliseconds) */
  shutdownTimeout?: number;
}

export type ProjectCategory = "package" | "example" | "backend" | "e2e" | "template";

export interface HealthCheckConfig {
  /** Health check endpoint URL */
  endpoint?: string;
  /** Health check timeout (in milliseconds) */
  timeout?: number;
  /** Health check interval (in milliseconds) */
  interval?: number;
  /** Custom health check command */
  command?: string;
  /** Expected response for health check */
  expectedResponse?: string | RegExp;
}

// ============================================================================
// Server Management Types
// ============================================================================

export interface ServerInfo {
  /** Project name */
  name: string;
  /** Current server status */
  status: ServerStatus;
  /** Server health status */
  health: ServerHealth;
  /** Port number */
  port: number;
  /** Process ID */
  pid?: number;
  /** Startup time */
  startTime?: Date;
  /** Last health check time */
  lastHealthCheck?: Date;
  /** Last error message */
  lastError?: string;
  /** Server metadata */
  metadata?: Record<string, any>;
}

export type ServerStatus = "stopped" | "starting" | "running" | "stopping" | "error" | "health_check_failed";

export type ServerHealth = "healthy" | "degraded" | "unhealthy" | "unknown";

// ============================================================================
// Port Management Types
// ============================================================================

export interface PortInfo {
  /** Port number */
  port: number;
  /** Whether the port is currently in use */
  inUse: boolean;
  /** Process using the port (if any) */
  process?: {
    pid: number;
    name: string;
    command: string;
  };
  /** Port allocation timestamp */
  allocatedAt?: Date;
  /** Project using the port */
  project?: string;
}

export interface PortAllocation {
  /** Requested port */
  requested: number;
  /** Actually allocated port */
  allocated: number;
  /** Whether the requested port was available */
  wasAvailable: boolean;
  /** Alternative port range used */
  alternativeRange?: {
    start: number;
    end: number;
  };
}

// ============================================================================
// Process Management Types
// ============================================================================

export interface ProcessInfo {
  /** Process ID */
  pid: number;
  /** Project name */
  project: string;
  /** Process status */
  status: ServerStatus;
  /** Start time */
  startTime: Date;
  /** Command being executed */
  command: string;
  /** Working directory */
  cwd: string;
  /** Environment variables */
  env: Record<string, string>;
  /** Process output streams */
  streams: {
    stdout: NodeJS.ReadableStream;
    stderr: NodeJS.ReadableStream;
  };
  /** Exit code (if process has exited) */
  exitCode?: number;
  /** Exit signal (if process was killed) */
  exitSignal?: string;
  /** Last error message */
  lastError?: string;
}

export interface ProcessOptions {
  /** Command to execute */
  command: string;
  /** Command arguments */
  args?: string[];
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Whether to inherit stdio */
  inheritStdio?: boolean;
  /** Process timeout */
  timeout?: number;
  /** Whether to detach the process */
  detached?: boolean;
}

// ============================================================================
// Health Monitoring Types
// ============================================================================

export interface HealthStatus {
  /** Project name */
  project: string;
  /** Health status */
  health: ServerHealth;
  /** Last check time */
  lastCheck: Date;
  /** Check duration (in milliseconds) */
  checkDuration: number;
  /** Error message (if unhealthy) */
  error?: string;
  /** Health check metrics */
  metrics?: Record<string, any>;
  /** Response time (for HTTP health checks) */
  responseTime?: number;
  /** HTTP status code (for HTTP health checks) */
  statusCode?: number;
}

export interface HealthCheckResult {
  /** Whether the health check passed */
  success: boolean;
  /** Health status */
  health: ServerHealth;
  /** Check duration (in milliseconds) */
  duration: number;
  /** Error message (if failed) */
  error?: string;
  /** Response data */
  response?: any;
  /** HTTP status code (for HTTP checks) */
  statusCode?: number;
  /** Response time (in milliseconds) */
  responseTime?: number;
}

// ============================================================================
// Configuration Management Types
// ============================================================================

export interface DevServerConfig {
  /** Configuration version */
  version: string;
  /** Global configuration */
  global: GlobalConfig;
  /** Project configurations */
  projects: Record<string, ProjectConfig>;
  /** Port ranges for different categories */
  portRanges: Record<ProjectCategory, PortRange>;
  /** Health check configuration */
  healthCheck: HealthCheckConfig;
  /** Logging configuration */
  logging: LoggingConfig;
}

export interface GlobalConfig {
  /** Maximum concurrent servers */
  maxConcurrentServers?: number;
  /** Default startup timeout */
  defaultStartupTimeout?: number;
  /** Default shutdown timeout */
  defaultShutdownTimeout?: number;
  /** Health check interval */
  healthCheckInterval?: number;
  /** Auto-restart on failure */
  autoRestart?: boolean;
  /** Maximum restart attempts */
  maxRestartAttempts?: number;
  /** Restart delay (in milliseconds) */
  restartDelay?: number;
}

export interface PortRange {
  /** Start of port range */
  start: number;
  /** End of port range */
  end: number;
  /** Reserved ports within the range */
  reserved?: number[];
}

export interface LoggingConfig {
  /** Log level */
  level: "debug" | "info" | "warn" | "error";
  /** Log format */
  format: "json" | "text" | "colored";
  /** Log file path */
  file?: string;
  /** Maximum log file size */
  maxFileSize?: number;
  /** Maximum number of log files */
  maxFiles?: number;
}

// ============================================================================
// Event System Types
// ============================================================================

export interface DevServerEvent {
  /** Event type */
  type: DevServerEventType;
  /** Project name */
  project: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event data */
  data?: any;
  /** Event metadata */
  metadata?: Record<string, any>;
}

export type DevServerEventType =
  | "server_starting"
  | "server_started"
  | "server_stopping"
  | "server_stopped"
  | "server_error"
  | "health_check_started"
  | "health_check_completed"
  | "health_check_failed"
  | "port_allocated"
  | "port_released"
  | "config_loaded"
  | "config_updated";

export type DevServerEventHandler = (event: DevServerEvent) => void;

// ============================================================================
// CLI Types
// ============================================================================

export interface CLICommand {
  /** Command name */
  name: string;
  /** Command description */
  description: string;
  /** Command options */
  options?: CLIOption[];
  /** Command arguments */
  args?: CLIArgument[];
  /** Command handler */
  handler: (args: any, options: any) => Promise<void>;
}

export interface CLIOption {
  /** Option name */
  name: string;
  /** Option description */
  description: string;
  /** Option type */
  type: "string" | "boolean" | "number";
  /** Default value */
  default?: any;
  /** Whether the option is required */
  required?: boolean;
  /** Option aliases */
  aliases?: string[];
}

export interface CLIArgument {
  /** Argument name */
  name: string;
  /** Argument description */
  description: string;
  /** Whether the argument is required */
  required?: boolean;
  /** Whether the argument is variadic */
  variadic?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class DevServerError extends Error {
  constructor(
    message: string,
    public code: string,
    public project?: string,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = "DevServerError";
  }
}

export class ProjectNotFoundError extends DevServerError {
  constructor(project: string) {
    super(`Project '${project}' not found`, "PROJECT_NOT_FOUND", project);
    this.name = "ProjectNotFoundError";
  }
}

export class PortConflictError extends DevServerError {
  constructor(port: number, project: string) {
    super(`Port ${port} is already in use by project '${project}'`, "PORT_CONFLICT", project, { port });
    this.name = "PortConflictError";
  }
}

export class ProcessStartError extends DevServerError {
  constructor(project: string, command: string, error: Error) {
    super(`Failed to start process for project '${project}': ${error.message}`, "PROCESS_START_ERROR", project, {
      command,
      originalError: error.message,
    });
    this.name = "ProcessStartError";
  }
}

export class HealthCheckError extends DevServerError {
  constructor(project: string, endpoint: string, error: Error) {
    super(
      `Health check failed for project '${project}' at ${endpoint}: ${error.message}`,
      "HEALTH_CHECK_ERROR",
      project,
      { endpoint, originalError: error.message }
    );
    this.name = "HealthCheckError";
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export interface DevServerManager {
  /** Start a development server */
  start(project: string): Promise<void>;
  /** Stop a development server */
  stop(project: string): Promise<void>;
  /** Restart a development server */
  restart(project: string): Promise<void>;
  /** Get server status */
  status(project?: string): Promise<ServerInfo[]>;
  /** List available projects */
  list(): Promise<ProjectConfig[]>;
  /** Get health status */
  health(project?: string): Promise<HealthStatus[]>;
  /** Start multiple servers */
  startMultiple(projects: string[]): Promise<void>;
  /** Stop all servers */
  stopAll(): Promise<void>;
  /** Reload configuration */
  reloadConfig(): Promise<void>;
}

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Validation metadata */
  metadata?: Record<string, any>;
}
