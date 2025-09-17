/**
 * 🦊 Reynard Dev Server Package
 * 
 * Modern development server management for the Reynard ecosystem.
 * Provides type-safe, modular, and extensible development server orchestration.
 */

// Core exports
export { DevServerManager } from './core/DevServerManager.js';
export { ConfigManager } from './core/ConfigManager.js';
export { PortManager } from './core/PortManager.js';
export { ProcessManager } from './core/ProcessManager.js';
export { HealthChecker } from './core/HealthChecker.js';

// Type exports
export type {
  // Core types
  DevServerManager as IDevServerManager,
  ProjectConfig,
  ProjectCategory,
  ServerInfo,
  ServerStatus,
  ServerHealth,
  
  // Configuration types
  DevServerConfig,
  GlobalConfig,
  PortRange,
  LoggingConfig,
  HealthCheckConfig,
  
  // Port management types
  PortInfo,
  PortAllocation,
  
  // Process management types
  ProcessInfo,
  ProcessOptions,
  
  // Health monitoring types
  HealthStatus,
  HealthCheckResult,
  
  // Event system types
  DevServerEvent,
  DevServerEventType,
  DevServerEventHandler,
  
  // CLI types
  CLICommand,
  CLIOption,
  CLIArgument,
  
  // Error types
  DevServerError,
  ProjectNotFoundError,
  PortConflictError,
  ProcessStartError,
  HealthCheckError,
  
  // Utility types
  ValidationResult,
} from './types/index.js';

// Re-export key types for convenience
export type { 
  ServiceStatus, 
  ServiceHealth 
} from 'reynard-service-manager';

export type { 
  QueueStatus, 
  ProcessingResult 
} from 'reynard-queue-watcher';

// Default export
export { DevServerManager as default } from './core/DevServerManager.js';
