/**
 * Feature Service Bridge
 *
 * Bridges the service manager with the reynard-features system to provide
 * real-time service availability updates to the feature management system.
 */
import { ServiceManager, ServiceStatus, ServiceHealth } from "../index.js";
import type { FeatureManager } from "reynard-features";
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
export declare class FeatureServiceBridge {
    private serviceManager;
    private featureManager;
    private autoSync;
    private serviceNameMapping;
    private eventHandler;
    private isInitialized;
    constructor(config: FeatureServiceBridgeConfig);
    /**
     * Initialize the bridge and start syncing
     */
    initialize(): void;
    /**
     * Cleanup and stop syncing
     */
    destroy(): void;
    /**
     * Handle service manager events
     */
    private handleServiceEvent;
    /**
     * Update service availability in feature manager
     */
    private updateServiceAvailability;
    /**
     * Update service health in feature manager
     */
    private updateServiceHealth;
    /**
     * Sync all service statuses to feature manager
     */
    private syncAllServiceStatuses;
    /**
     * Get service availability by name
     */
    private getServiceAvailability;
    /**
     * Map service name from feature system to service manager
     */
    private mapServiceName;
    /**
     * Get original service name from mapped name
     */
    private getOriginalServiceName;
    /**
     * Get mapped service name from original name
     */
    private getMappedServiceName;
    /**
     * Get service status for a specific service
     */
    getServiceStatus(serviceName: string): {
        available: boolean;
        status: ServiceStatus;
        health: ServiceHealth;
        lastError?: string;
    };
    /**
     * Get all service statuses
     */
    getAllServiceStatuses(): Record<string, {
        available: boolean;
        status: ServiceStatus;
        health: ServiceHealth;
        lastError?: string;
    }>;
    /**
     * Force sync of all service statuses
     */
    forceSync(): void;
    /**
     * Add service name mapping
     */
    addServiceMapping(originalName: string, mappedName: string): void;
    /**
     * Remove service name mapping
     */
    removeServiceMapping(originalName: string): void;
}
