/**
 * Shared AI/ML Services for Reynard
 *
 * This module provides base service classes and interfaces that all AI/ML
 * services in the Reynard framework should extend. These classes provide
 * common functionality for lifecycle management, health monitoring, and
 * service coordination.
 */

import {
  HealthCheckCallback,
  InitializationCallback,
  ServiceConfig,
  ServiceError,
  ServiceHealth,
  ServiceHealthInfo,
  ServiceStatus,
  ShutdownCallback,
} from "../types/index.js";

// ============================================================================
// Base AI Service Class
// ============================================================================

/**
 * Abstract base class for all AI/ML services in Reynard.
 *
 * Provides common functionality for:
 * - Service lifecycle management (start, stop, restart)
 * - Health monitoring and status reporting
 * - Dependency management
 * - Error handling and logging
 * - Configuration management
 *
 * All AI/ML services should extend this class to ensure consistency
 * and interoperability across the Reynard ecosystem.
 */
export abstract class BaseAIService {
  protected _name: string;
  protected _status: ServiceStatus = ServiceStatus.STOPPED;
  protected _health: ServiceHealth = ServiceHealth.UNKNOWN;
  protected _dependencies: string[] = [];
  protected _startupPriority: number = 100;
  protected _requiredPackages: string[] = [];
  protected _autoStart: boolean = true;
  protected _startupTime?: Date;
  protected _lastHealthCheck?: Date;
  protected _lastError?: string;
  protected _metadata: Record<string, any> = {};
  protected _healthCheckInterval?: NodeJS.Timeout;
  protected _isInitialized = false;
  protected _healthCheckCallback?: HealthCheckCallback;
  protected _shutdownCallback?: ShutdownCallback;
  protected _initializationCallback?: InitializationCallback;

  constructor(config: ServiceConfig) {
    this._name = config.name;
    this._dependencies = config.dependencies || [];
    this._startupPriority = config.startupPriority || 100;
    this._requiredPackages = config.requiredPackages || [];
    this._autoStart = config.autoStart !== false;
    this._metadata = config.config || {};
  }

  // ========================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ========================================================================

  /**
   * Initialize the service. This method should be implemented by subclasses
   * to perform any necessary setup, model loading, or resource allocation.
   */
  abstract initialize(): Promise<void>;

  /**
   * Perform a health check on the service. This method should be implemented
   * by subclasses to check if the service is functioning correctly.
   */
  abstract healthCheck(): Promise<ServiceHealthInfo>;

  /**
   * Shutdown the service gracefully. This method should be implemented by
   * subclasses to clean up resources, save state, and perform any necessary
   * cleanup operations.
   */
  abstract shutdown(): Promise<void>;

  // ========================================================================
  // Public Interface
  // ========================================================================

  /**
   * Get the service name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get the current service status
   */
  get status(): ServiceStatus {
    return this._status;
  }

  /**
   * Get the current service health
   */
  get health(): ServiceHealth {
    return this._health;
  }

  /**
   * Get service dependencies
   */
  get dependencies(): string[] {
    return [...this._dependencies];
  }

  /**
   * Get startup priority (lower = higher priority)
   */
  get startupPriority(): number {
    return this._startupPriority;
  }

  /**
   * Get required packages
   */
  get requiredPackages(): string[] {
    return [...this._requiredPackages];
  }

  /**
   * Check if service should auto-start
   */
  get autoStart(): boolean {
    return this._autoStart;
  }

  /**
   * Check if service is initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Get service metadata
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * Get startup time
   */
  get startupTime(): Date | undefined {
    return this._startupTime;
  }

  /**
   * Get last health check time
   */
  get lastHealthCheck(): Date | undefined {
    return this._lastHealthCheck;
  }

  /**
   * Get last error message
   */
  get lastError(): string | undefined {
    return this._lastError;
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  /**
   * Start the service
   */
  async start(): Promise<void> {
    if (this._status === ServiceStatus.RUNNING) {
      return;
    }

    try {
      this._status = ServiceStatus.STARTING;
      this._startupTime = new Date();

      // Initialize the service
      await this.initialize();
      this._isInitialized = true;

      // Set up health monitoring
      this._setupHealthMonitoring();

      this._status = ServiceStatus.RUNNING;
      this._health = ServiceHealth.HEALTHY;
      this._lastError = undefined;
    } catch (error) {
      this._status = ServiceStatus.ERROR;
      this._health = ServiceHealth.UNHEALTHY;
      this._lastError = error instanceof Error ? error.message : String(error);
      throw new ServiceError(`Failed to start service ${this._name}: ${this._lastError}`, this._name, { error });
    }
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    if (this._status === ServiceStatus.STOPPED) {
      return;
    }

    try {
      this._status = ServiceStatus.STOPPING;

      // Stop health monitoring
      this._stopHealthMonitoring();

      // Shutdown the service
      await this.shutdown();

      this._status = ServiceStatus.STOPPED;
      this._health = ServiceHealth.UNKNOWN;
      this._isInitialized = false;
    } catch (error) {
      this._status = ServiceStatus.ERROR;
      this._health = ServiceHealth.UNHEALTHY;
      this._lastError = error instanceof Error ? error.message : String(error);
      throw new ServiceError(`Failed to stop service ${this._name}: ${this._lastError}`, this._name, { error });
    }
  }

  /**
   * Restart the service
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  // ========================================================================
  // Health Monitoring
  // ========================================================================

  /**
   * Set up automatic health monitoring
   */
  private _setupHealthMonitoring(): void {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
    }

    this._healthCheckInterval = setInterval(async () => {
      try {
        const healthInfo = await this.healthCheck();
        this._health = healthInfo.health;
        this._lastHealthCheck = new Date();
        this._lastError = undefined;
      } catch (error) {
        this._health = ServiceHealth.UNHEALTHY;
        this._lastError = error instanceof Error ? error.message : String(error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health monitoring
   */
  private _stopHealthMonitoring(): void {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
      this._healthCheckInterval = undefined;
    }
  }

  /**
   * Get comprehensive service information
   */
  async getServiceInfo(): Promise<ServiceHealthInfo> {
    const healthInfo = await this.healthCheck();
    return {
      ...healthInfo,
      status: this._status,
      health: this._health,
      lastCheck: this._lastHealthCheck || new Date(),
      uptime: this._startupTime ? Date.now() - this._startupTime.getTime() : 0,
      errorCount: this._lastError ? 1 : 0,
      lastError: this._lastError,
      metadata: this._metadata,
    };
  }

  // ========================================================================
  // Configuration Management
  // ========================================================================

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<Record<string, any>>): void {
    this._metadata = { ...this._metadata, ...config };
  }

  /**
   * Get service configuration
   */
  getConfig(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * Get a specific configuration value
   */
  getConfigValue(key: string): any {
    return this._metadata[key];
  }

  /**
   * Set a specific configuration value
   */
  setConfigValue(key: string, value: any): void {
    this._metadata[key] = value;
  }

  // ========================================================================
  // Callback Management
  // ========================================================================

  /**
   * Set health check callback
   */
  setHealthCheckCallback(callback: HealthCheckCallback): void {
    this._healthCheckCallback = callback;
  }

  /**
   * Set shutdown callback
   */
  setShutdownCallback(callback: ShutdownCallback): void {
    this._shutdownCallback = callback;
  }

  /**
   * Set initialization callback
   */
  setInitializationCallback(callback: InitializationCallback): void {
    this._initializationCallback = callback;
  }
}

// ============================================================================
// Service Registry
// ============================================================================

/**
 * Registry for managing AI/ML services
 */
export class ServiceRegistry {
  private _services: Map<string, BaseAIService> = new Map();
  private _startupOrder: string[] = [];

  /**
   * Register a service
   */
  register(service: BaseAIService): void {
    this._services.set(service.name, service);
    this._updateStartupOrder();
  }

  /**
   * Unregister a service
   */
  unregister(serviceName: string): void {
    this._services.delete(serviceName);
    this._updateStartupOrder();
  }

  /**
   * Get a service by name
   */
  get(serviceName: string): BaseAIService | undefined {
    return this._services.get(serviceName);
  }

  /**
   * Get all registered services
   */
  getAll(): BaseAIService[] {
    return Array.from(this._services.values());
  }

  /**
   * Get services in startup order
   */
  getStartupOrder(): string[] {
    return [...this._startupOrder];
  }

  /**
   * Check if a service is registered
   */
  has(serviceName: string): boolean {
    return this._services.has(serviceName);
  }

  /**
   * Get service count
   */
  get count(): number {
    return this._services.size;
  }

  /**
   * Update startup order based on dependencies and priorities
   */
  private _updateStartupOrder(): void {
    const services = Array.from(this._services.values());

    // Sort by startup priority (lower = higher priority)
    services.sort((a, b) => a.startupPriority - b.startupPriority);

    // TODO: Implement dependency resolution for proper startup order
    this._startupOrder = services.map(service => service.name);
  }

  /**
   * Start all services in order
   */
  async startAll(): Promise<void> {
    for (const serviceName of this._startupOrder) {
      const service = this._services.get(serviceName);
      if (service && service.autoStart) {
        try {
          await service.start();
        } catch (error) {
          console.error(`Failed to start service ${serviceName}:`, error);
        }
      }
    }
  }

  /**
   * Stop all services in reverse order
   */
  async stopAll(): Promise<void> {
    for (const serviceName of this._startupOrder.reverse()) {
      const service = this._services.get(serviceName);
      if (service) {
        try {
          await service.stop();
        } catch (error) {
          console.error(`Failed to stop service ${serviceName}:`, error);
        }
      }
    }
  }
}

// ============================================================================
// Global Service Registry Instance
// ============================================================================

let globalServiceRegistry: ServiceRegistry | null = null;

/**
 * Get the global service registry instance
 */
export function getServiceRegistry(): ServiceRegistry {
  if (!globalServiceRegistry) {
    globalServiceRegistry = new ServiceRegistry();
  }
  return globalServiceRegistry;
}

/**
 * Reset the global service registry (mainly for testing)
 */
export function resetServiceRegistry(): void {
  globalServiceRegistry = null;
}

// ============================================================================
// Export all services
// ============================================================================
