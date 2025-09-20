/**
 * Service Manager
 *
 * Main orchestrator for service lifecycle management, dependency resolution,
 * and health monitoring.
 */

import { BaseService } from "../services/BaseService.js";
import { ServiceRegistry } from "./ServiceRegistry.js";
import { DependencyGraph } from "./DependencyGraph.js";
import {
  ServiceManagerConfig,
  ServiceManagerState,
  ServiceEvent,
  ServiceEventHandler,
  ServiceStartupProgress,
  ServiceInfo,
  ServiceStatus,
  ServiceHealth,
} from "../types/index.js";

export class ServiceManager {
  private _services: Map<string, BaseService> = new Map();
  private _registry: ServiceRegistry = new ServiceRegistry();
  private _dependencyGraph: DependencyGraph = new DependencyGraph();
  private _config: ServiceManagerConfig;
  private _eventHandlers: Set<ServiceEventHandler> = new Set();
  private _startupTasks: Map<string, Promise<void>> = new Map();
  private _isStarting = false;
  private _isShuttingDown = false;
  private _startupTime?: Date;
  private _totalStartupTime?: number;

  constructor(config: ServiceManagerConfig = {}) {
    this._config = {
      maxConcurrentStartup: 4,
      healthCheckInterval: 30000,
      startupTimeout: 300000, // 5 minutes
      shutdownTimeout: 60000, // 1 minute
      enableHealthMonitoring: true,
      ...config,
    };
  }

  // Service registration
  registerService(service: BaseService): void {
    if (this._services.has(service.name)) {
      console.warn(`Service '${service.name}' already registered, overwriting`);
    }

    this._services.set(service.name, service);

    // Add to dependency graph
    this._dependencyGraph.addService(
      service.name,
      service.dependencies,
      service.startupPriority,
      service.requiredPackages
    );

    // Register in registry
    this._registry.register({
      name: service.name,
      dependencies: service.dependencies,
      startupPriority: service.startupPriority,
      requiredPackages: service.requiredPackages,
      autoStart: service.autoStart,
    });

    this._emitEvent({
      type: "startup",
      serviceName: service.name,
      timestamp: new Date(),
      data: { action: "registered" },
    });
  }

  registerServices(services: BaseService[]): void {
    for (const service of services) {
      this.registerService(service);
    }
  }

  unregisterService(name: string): void {
    const service = this._services.get(name);
    if (service) {
      service.destroy();
      this._services.delete(name);
      this._dependencyGraph.removeService(name);
      this._registry.unregister(name);
    }
  }

  // Service access
  getService(name: string): BaseService | undefined {
    return this._services.get(name);
  }

  getServices(): Map<string, BaseService> {
    return new Map(this._services);
  }

  getServiceInfo(name: string): ServiceInfo | undefined {
    const service = this._services.get(name);
    return service?.getInfo();
  }

  getAllServiceInfo(): Record<string, ServiceInfo> {
    const result: Record<string, ServiceInfo> = {};
    for (const [name, service] of this._services) {
      result[name] = service.getInfo();
    }
    return result;
  }

  // Lifecycle management
  async startServices(): Promise<void> {
    if (this._isStarting) {
      throw new Error("Service startup already in progress");
    }

    if (this._isShuttingDown) {
      throw new Error("Cannot start services while shutting down");
    }

    this._isStarting = true;
    this._startupTime = new Date();

    try {
      // Validate dependencies
      const dependencyErrors = this._dependencyGraph.validateDependencies();
      if (dependencyErrors.length > 0) {
        throw new Error(`Dependency validation failed: ${dependencyErrors.join(", ")}`);
      }

      // Get startup order
      const startupOrder = this._dependencyGraph.getStartupOrder();
      const parallelGroups = this._dependencyGraph.getParallelGroups();

      this._emitEvent({
        type: "startup",
        serviceName: "system",
        timestamp: new Date(),
        data: {
          action: "startup_begin",
          startupOrder,
          parallelGroups,
        },
      });

      // Start services in parallel groups
      for (const group of parallelGroups) {
        const groupPromises = group.map(serviceName => this._startService(serviceName));
        await Promise.all(groupPromises);
      }

      this._totalStartupTime = Date.now() - this._startupTime.getTime();

      this._emitEvent({
        type: "startup",
        serviceName: "system",
        timestamp: new Date(),
        data: {
          action: "startup_complete",
          totalTime: this._totalStartupTime,
        },
      });
    } catch (error) {
      this._emitEvent({
        type: "error",
        serviceName: "system",
        timestamp: new Date(),
        data: {
          action: "startup_failed",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    } finally {
      this._isStarting = false;
    }
  }

  async stopServices(): Promise<void> {
    if (this._isShuttingDown) {
      return;
    }

    this._isShuttingDown = true;

    try {
      // Stop services in reverse order
      const startupOrder = this._dependencyGraph.getStartupOrder();
      const stopOrder = [...startupOrder].reverse();

      this._emitEvent({
        type: "shutdown",
        serviceName: "system",
        timestamp: new Date(),
        data: { action: "shutdown_begin" },
      });

      for (const serviceName of stopOrder) {
        await this._stopService(serviceName);
      }

      this._emitEvent({
        type: "shutdown",
        serviceName: "system",
        timestamp: new Date(),
        data: { action: "shutdown_complete" },
      });
    } finally {
      this._isShuttingDown = false;
    }
  }

  // Individual service control
  async startService(name: string): Promise<void> {
    await this._startService(name);
  }

  async stopService(name: string): Promise<void> {
    await this._stopService(name);
  }

  private async _startService(name: string): Promise<void> {
    const service = this._services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }

    if (service.status === ServiceStatus.RUNNING) {
      return;
    }

    // Check if already starting
    if (this._startupTasks.has(name)) {
      return this._startupTasks.get(name);
    }

    const startupPromise = this._performServiceStartup(name, service);
    this._startupTasks.set(name, startupPromise);

    try {
      await startupPromise;
    } finally {
      this._startupTasks.delete(name);
    }
  }

  private async _performServiceStartup(name: string, service: BaseService): Promise<void> {
    try {
      this._emitEvent({
        type: "startup",
        serviceName: name,
        timestamp: new Date(),
        data: { action: "starting" },
      });

      await service.start();

      this._emitEvent({
        type: "startup",
        serviceName: name,
        timestamp: new Date(),
        data: { action: "started" },
      });
    } catch (error) {
      this._emitEvent({
        type: "error",
        serviceName: name,
        timestamp: new Date(),
        data: {
          action: "startup_failed",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  private async _stopService(name: string): Promise<void> {
    const service = this._services.get(name);
    if (!service) {
      return;
    }

    try {
      this._emitEvent({
        type: "shutdown",
        serviceName: name,
        timestamp: new Date(),
        data: { action: "stopping" },
      });

      await service.stop();

      this._emitEvent({
        type: "shutdown",
        serviceName: name,
        timestamp: new Date(),
        data: { action: "stopped" },
      });
    } catch (error) {
      this._emitEvent({
        type: "error",
        serviceName: name,
        timestamp: new Date(),
        data: {
          action: "shutdown_failed",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  // State and monitoring
  getState(): ServiceManagerState {
    const services: Record<string, ServiceInfo> = {};
    for (const [name, service] of this._services) {
      services[name] = service.getInfo();
    }

    return {
      services,
      startupOrder: this._dependencyGraph.getStartupOrder(),
      parallelGroups: this._dependencyGraph.getParallelGroups(),
      isStarting: this._isStarting,
      isShuttingDown: this._isShuttingDown,
      startupProgress: this._getStartupProgress(),
      totalStartupTime: this._totalStartupTime,
      lastUpdate: new Date(),
    };
  }

  private _getStartupProgress(): Record<string, ServiceStartupProgress> {
    const progress: Record<string, ServiceStartupProgress> = {};

    for (const [name, service] of this._services) {
      let progressValue = 0;
      let status = "stopped";

      switch (service.status) {
        case ServiceStatus.STOPPED:
          progressValue = 0;
          status = "stopped";
          break;
        case ServiceStatus.STARTING:
          progressValue = 50;
          status = "starting";
          break;
        case ServiceStatus.RUNNING:
          progressValue = 100;
          status = "running";
          break;
        case ServiceStatus.STOPPING:
          progressValue = 75;
          status = "stopping";
          break;
        case ServiceStatus.ERROR:
          progressValue = 0;
          status = "error";
          break;
      }

      progress[name] = {
        serviceName: name,
        progress: progressValue,
        status,
        error: service.lastError,
      };
    }

    return progress;
  }

  // Event handling
  addEventListener(handler: ServiceEventHandler): void {
    this._eventHandlers.add(handler);
  }

  removeEventListener(handler: ServiceEventHandler): void {
    this._eventHandlers.delete(handler);
  }

  private _emitEvent(event: ServiceEvent): void {
    for (const handler of this._eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in service event handler:", error);
      }
    }
  }

  // Utility methods
  isServiceRunning(name: string): boolean {
    const service = this._services.get(name);
    return service?.status === ServiceStatus.RUNNING;
  }

  isServiceHealthy(name: string): boolean {
    const service = this._services.get(name);
    return service?.health === ServiceHealth.HEALTHY;
  }

  getServiceHealth(name: string): ServiceHealth | undefined {
    const service = this._services.get(name);
    return service?.health;
  }

  // Cleanup
  destroy(): void {
    this.stopServices();
    for (const service of this._services.values()) {
      service.destroy();
    }
    this._services.clear();
    this._registry.clear();
    this._eventHandlers.clear();
  }
}
