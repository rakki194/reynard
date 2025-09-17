/**
 * Base Service Class
 *
 * Abstract base class that all services must extend. Provides common
 * lifecycle management, health monitoring, and metadata handling.
 */

import { ServiceStatus, ServiceHealth, ServiceInfo, ServiceHealthInfo, ServiceConfig } from "../types/index.js";

export abstract class BaseService {
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

  constructor(config: ServiceConfig) {
    this._name = config.name;
    this._dependencies = config.dependencies || [];
    this._startupPriority = config.startupPriority || 100;
    this._requiredPackages = config.requiredPackages || [];
    this._autoStart = config.autoStart !== false;
    this._metadata = config.config || {};
  }

  // Abstract methods that must be implemented by subclasses
  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;
  abstract healthCheck(): Promise<ServiceHealth>;

  // Getters
  get name(): string {
    return this._name;
  }

  get status(): ServiceStatus {
    return this._status;
  }

  get health(): ServiceHealth {
    return this._health;
  }

  get dependencies(): string[] {
    return [...this._dependencies];
  }

  get startupPriority(): number {
    return this._startupPriority;
  }

  get requiredPackages(): string[] {
    return [...this._requiredPackages];
  }

  get autoStart(): boolean {
    return this._autoStart;
  }

  get startupTime(): Date | undefined {
    return this._startupTime;
  }

  get lastHealthCheck(): Date | undefined {
    return this._lastHealthCheck;
  }

  get lastError(): string | undefined {
    return this._lastError;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // Lifecycle methods
  async start(): Promise<void> {
    if (this._status === ServiceStatus.RUNNING) {
      return;
    }

    if (this._status === ServiceStatus.STARTING) {
      throw new Error(`Service ${this._name} is already starting`);
    }

    try {
      this._status = ServiceStatus.STARTING;
      this._lastError = undefined;

      // Verify dependencies are ready
      await this.verifyDependencies();

      // Verify required packages are available
      await this.verifyRequiredPackages();

      // Initialize the service
      await this.initialize();
      this._isInitialized = true;

      // Transition to running
      this._status = ServiceStatus.RUNNING;
      this._startupTime = new Date();

      // Start health monitoring
      this.startHealthMonitoring();
    } catch (error) {
      this._status = ServiceStatus.ERROR;
      this._lastError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this._status === ServiceStatus.STOPPED) {
      return;
    }

    try {
      this._status = ServiceStatus.STOPPING;

      // Stop health monitoring
      this.stopHealthMonitoring();

      // Shutdown the service
      await this.shutdown();
      this._isInitialized = false;

      // Transition to stopped
      this._status = ServiceStatus.STOPPED;
    } catch (error) {
      this._status = ServiceStatus.ERROR;
      this._lastError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  // Health monitoring
  protected startHealthMonitoring(): void {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
    }

    this._healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.healthCheck();
        this._health = health;
        this._lastHealthCheck = new Date();
      } catch (error) {
        this._health = ServiceHealth.UNHEALTHY;
        this._lastError = error instanceof Error ? error.message : String(error);
        this._lastHealthCheck = new Date();
      }
    }, 30000); // Check every 30 seconds
  }

  protected stopHealthMonitoring(): void {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
      this._healthCheckInterval = undefined;
    }
  }

  // Dependency and package verification
  protected async verifyDependencies(): Promise<void> {
    // This should be implemented by the service manager
    // For now, we'll just log that dependencies should be verified
    console.debug(`Service ${this._name} dependencies should be verified:`, this._dependencies);
  }

  protected async verifyRequiredPackages(): Promise<void> {
    // This should be implemented by the service manager
    // For now, we'll just log that packages should be verified
    console.debug(`Service ${this._name} required packages should be verified:`, this._requiredPackages);
  }

  // Utility methods
  getInfo(): ServiceInfo {
    return {
      name: this._name,
      status: this._status,
      health: this._health,
      dependencies: this._dependencies,
      startupPriority: this._startupPriority,
      requiredPackages: this._requiredPackages,
      autoStart: this._autoStart,
      startupTime: this._startupTime,
      lastHealthCheck: this._lastHealthCheck,
      lastError: this._lastError,
      metadata: this._metadata,
    };
  }

  getHealthInfo(): ServiceHealthInfo {
    return {
      status: this._health,
      lastCheck: this._lastHealthCheck || new Date(),
      startupTime: this._startupTime,
      error: this._lastError,
    };
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  // Cleanup
  destroy(): void {
    this.stopHealthMonitoring();
    this._status = ServiceStatus.STOPPED;
    this._isInitialized = false;
  }
}
