/**
 * Service Management Types
 *
 * Core types for the service management system including service lifecycle,
 * health monitoring, dependency management, and service registry.
 */

export enum ServiceStatus {
  STOPPED = "stopped",
  STARTING = "starting",
  RUNNING = "running",
  STOPPING = "stopping",
  ERROR = "error",
}

export enum ServiceHealth {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
  UNKNOWN = "unknown",
}

export interface ServiceInfo {
  name: string;
  status: ServiceStatus;
  health: ServiceHealth;
  dependencies: string[];
  startupPriority: number;
  requiredPackages?: string[];
  autoStart: boolean;
  startupTime?: Date;
  lastHealthCheck?: Date;
  lastError?: string;
  metadata?: Record<string, any>;
}

export interface ServiceHealthInfo {
  status: ServiceHealth;
  lastCheck: Date;
  startupTime?: Date;
  error?: string;
  metrics?: Record<string, any>;
}

export interface ServiceDependency {
  name: string;
  required: boolean;
  startupPriority: number;
}

export interface ServiceConfig {
  name: string;
  dependencies?: string[];
  startupPriority?: number;
  requiredPackages?: string[];
  autoStart?: boolean;
  config?: Record<string, any>;
}

export interface ServiceManagerConfig {
  maxConcurrentStartup?: number;
  healthCheckInterval?: number;
  startupTimeout?: number;
  shutdownTimeout?: number;
  enableHealthMonitoring?: boolean;
}

export interface ServiceStartupProgress {
  serviceName: string;
  progress: number; // 0-100
  status: string;
  error?: string;
}

export interface ServiceManagerState {
  services: Record<string, ServiceInfo>;
  startupOrder: string[];
  parallelGroups: string[][];
  isStarting: boolean;
  isShuttingDown: boolean;
  startupProgress: Record<string, ServiceStartupProgress>;
  totalStartupTime?: number;
  lastUpdate: Date;
}

export interface ServiceEvent {
  type: "startup" | "shutdown" | "health_change" | "error" | "progress";
  serviceName: string;
  timestamp: Date;
  data?: any;
}

export type ServiceEventHandler = (event: ServiceEvent) => void;

export interface ServiceRegistry {
  register(config: ServiceConfig): void;
  unregister(name: string): void;
  get(name: string): ServiceConfig | undefined;
  getAll(): Record<string, ServiceConfig>;
  isRegistered(name: string): boolean;
}

export interface DependencyGraph {
  addService(name: string, dependencies: string[], startupPriority: number, requiredPackages?: string[]): void;
  removeService(name: string): void;
  getStartupOrder(): string[];
  getParallelGroups(): string[][];
  validateDependencies(): string[];
  getDependencies(name: string): string[];
  getDependents(name: string): string[];
}
