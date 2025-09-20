/**
 * Feature Service Bridge
 *
 * Bridges the service manager with the reynard-features system to provide
 * real-time service availability updates to the feature management system.
 */

import type { ServiceEvent, ServiceEventHandler } from "../types/index.js";
import { ServiceManager, ServiceStatus, ServiceHealth } from "../index.js";
import type { FeatureManager, FeatureConfig } from "reynard-features";

export interface FeatureServiceBridgeConfig {
  /** Service manager instance */
  serviceManager: ServiceManager;
  /** Feature manager instance */
  featureManager: FeatureManager;
  /** Whether to automatically sync service status changes */
  autoSync?: boolean;
  /** Custom service name mapping */
  serviceNameMapping?: Record<string, string>;
}

/**
 * Bridge between service manager and feature system
 */
export class FeatureServiceBridge {
  private serviceManager: ServiceManager;
  private featureManager: FeatureManager;
  private autoSync: boolean;
  private serviceNameMapping: Record<string, string>;
  private serviceAvailabilityCache: Map<string, boolean>;
  private eventHandler: ServiceEventHandler;
  private isInitialized = false;

  constructor(config: FeatureServiceBridgeConfig) {
    this.serviceManager = config.serviceManager;
    this.featureManager = config.featureManager;
    this.autoSync = config.autoSync ?? true;
    this.serviceNameMapping = config.serviceNameMapping ?? {};
    this.serviceAvailabilityCache = new Map<string, boolean>();

    // Create event handler for service status changes
    this.eventHandler = (event: ServiceEvent) => {
      this.handleServiceEvent(event);
    };

    if (this.autoSync) {
      this.initialize();
    }
  }

  /**
   * Initialize the bridge and start syncing
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Subscribe to service manager events
    this.serviceManager.addEventListener(this.eventHandler);

    // Initial sync of all service statuses
    this.syncAllServiceStatuses();

    this.isInitialized = true;
  }

  /**
   * Cleanup and stop syncing
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    // Unsubscribe from service manager events
    this.serviceManager.removeEventListener(this.eventHandler);

    this.isInitialized = false;
  }

  /**
   * Handle service manager events
   */
  private handleServiceEvent(event: ServiceEvent): void {
    switch (event.type) {
      case "startup":
        this.updateServiceAvailability(event.serviceName, true);
        break;
      case "shutdown":
        this.updateServiceAvailability(event.serviceName, false);
        break;
      case "health_change":
        this.updateServiceHealth(event.serviceName, event.data?.health);
        break;
      case "error":
        this.updateServiceAvailability(event.serviceName, false);
        break;
    }
  }

  /**
   * Update service availability in feature manager
   */
  private updateServiceAvailability(serviceName: string, available: boolean): void {
    const mappedName = this.mapServiceName(serviceName);

    // Update the service availability cache
    this.serviceAvailabilityCache.set(mappedName, available);

    // Refresh feature statuses to reflect the change
    this.featureManager.refreshFeatureStatuses();
  }

  /**
   * Update service health in feature manager
   */
  private updateServiceHealth(serviceName: string, health?: ServiceHealth): void {
    const mappedName = this.mapServiceName(serviceName);
    const isHealthy = health === ServiceHealth.HEALTHY || health === ServiceHealth.DEGRADED;

    this.updateServiceAvailability(serviceName, isHealthy);
  }

  /**
   * Sync all service statuses to feature manager
   */
  private syncAllServiceStatuses(): void {
    const services = this.serviceManager.getServices();

    // Update service availability cache for all services
    services.forEach(service => {
      const mappedName = this.mapServiceName(service.name);
      const isAvailable = this.getServiceAvailability(service.name);
      this.serviceAvailabilityCache.set(mappedName, isAvailable);
    });

    // Refresh feature statuses to reflect all changes
    this.featureManager.refreshFeatureStatuses();
  }

  /**
   * Get service availability by name
   */
  private getServiceAvailability(serviceName: string): boolean {
    // Check if it's a mapped service name
    const originalName = this.getOriginalServiceName(serviceName);
    const service = this.serviceManager.getService(originalName);

    if (!service) {
      return false;
    }

    // Service is available if it's running and healthy
    const status = service.status;
    const health = service.health;

    return status === ServiceStatus.RUNNING && (health === ServiceHealth.HEALTHY || health === ServiceHealth.DEGRADED);
  }

  /**
   * Map service name from feature system to service manager
   */
  private mapServiceName(serviceName: string): string {
    return this.serviceNameMapping[serviceName] || serviceName;
  }

  /**
   * Get original service name from mapped name
   */
  private getOriginalServiceName(mappedName: string): string {
    // Find the original name for this mapped name
    for (const [original, mapped] of Object.entries(this.serviceNameMapping)) {
      if (mapped === mappedName) {
        return original;
      }
    }
    return mappedName;
  }

  /**
   * Get mapped service name from original name
   */
  private getMappedServiceName(originalName: string): string {
    // Find the key (mapped name) for this original service name
    for (const [mappedName, originalServiceName] of Object.entries(this.serviceNameMapping)) {
      if (originalServiceName === originalName) {
        return mappedName;
      }
    }
    return originalName;
  }

  /**
   * Get service status for a specific service
   */
  public getServiceStatus(serviceName: string): {
    available: boolean;
    status: ServiceStatus;
    health: ServiceHealth;
    lastError?: string;
  } {
    const originalName = this.getOriginalServiceName(serviceName);
    const service = this.serviceManager.getService(originalName);

    if (!service) {
      return {
        available: false,
        status: ServiceStatus.STOPPED,
        health: ServiceHealth.UNKNOWN,
      };
    }

    const available =
      service.status === ServiceStatus.RUNNING &&
      (service.health === ServiceHealth.HEALTHY || service.health === ServiceHealth.DEGRADED);

    return {
      available,
      status: service.status,
      health: service.health,
      lastError: service.lastError,
    };
  }

  /**
   * Get all service statuses
   */
  public getAllServiceStatuses(): Record<
    string,
    {
      available: boolean;
      status: ServiceStatus;
      health: ServiceHealth;
      lastError?: string;
    }
  > {
    const services = this.serviceManager.getServices();
    const statuses: Record<string, any> = {};

    for (const [serviceName, service] of services) {
      // Find the mapped name for this service
      const mappedName = this.getMappedServiceName(serviceName);
      statuses[mappedName] = this.getServiceStatus(mappedName);
    }

    return statuses;
  }

  /**
   * Force sync of all service statuses
   */
  public forceSync(): void {
    this.syncAllServiceStatuses();
  }

  /**
   * Add service name mapping
   */
  public addServiceMapping(originalName: string, mappedName: string): void {
    this.serviceNameMapping[originalName] = mappedName;
    this.forceSync();
  }

  /**
   * Remove service name mapping
   */
  public removeServiceMapping(originalName: string): void {
    delete this.serviceNameMapping[originalName];
    this.forceSync();
  }
}
