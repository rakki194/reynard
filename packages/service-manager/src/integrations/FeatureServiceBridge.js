/**
 * Feature Service Bridge
 *
 * Bridges the service manager with the reynard-features system to provide
 * real-time service availability updates to the feature management system.
 */
import { ServiceStatus, ServiceHealth } from "../index.js";
/**
 * Bridge between service manager and feature system
 */
export class FeatureServiceBridge {
    constructor(config) {
        Object.defineProperty(this, "serviceManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "featureManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "autoSync", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "serviceNameMapping", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "serviceAvailabilityCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.serviceManager = config.serviceManager;
        this.featureManager = config.featureManager;
        this.autoSync = config.autoSync ?? true;
        this.serviceNameMapping = config.serviceNameMapping ?? {};
        this.serviceAvailabilityCache = new Map();
        // Create event handler for service status changes
        this.eventHandler = (event) => {
            this.handleServiceEvent(event);
        };
        if (this.autoSync) {
            this.initialize();
        }
    }
    /**
     * Initialize the bridge and start syncing
     */
    initialize() {
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
    destroy() {
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
    handleServiceEvent(event) {
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
    updateServiceAvailability(serviceName, available) {
        const mappedName = this.mapServiceName(serviceName);
        // Update the service availability cache
        this.serviceAvailabilityCache.set(mappedName, available);
        // Refresh feature statuses to reflect the change
        this.featureManager.refreshFeatureStatuses();
    }
    /**
     * Update service health in feature manager
     */
    updateServiceHealth(serviceName, health) {
        const mappedName = this.mapServiceName(serviceName);
        const isHealthy = health === ServiceHealth.HEALTHY || health === ServiceHealth.DEGRADED;
        this.updateServiceAvailability(serviceName, isHealthy);
    }
    /**
     * Sync all service statuses to feature manager
     */
    syncAllServiceStatuses() {
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
    getServiceAvailability(serviceName) {
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
    mapServiceName(serviceName) {
        return this.serviceNameMapping[serviceName] || serviceName;
    }
    /**
     * Get original service name from mapped name
     */
    getOriginalServiceName(mappedName) {
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
    getMappedServiceName(originalName) {
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
    getServiceStatus(serviceName) {
        const originalName = this.getOriginalServiceName(serviceName);
        const service = this.serviceManager.getService(originalName);
        if (!service) {
            return {
                available: false,
                status: ServiceStatus.STOPPED,
                health: ServiceHealth.UNKNOWN,
            };
        }
        const available = service.status === ServiceStatus.RUNNING &&
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
    getAllServiceStatuses() {
        const services = this.serviceManager.getServices();
        const statuses = {};
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
    forceSync() {
        this.syncAllServiceStatuses();
    }
    /**
     * Add service name mapping
     */
    addServiceMapping(originalName, mappedName) {
        this.serviceNameMapping[originalName] = mappedName;
        this.forceSync();
    }
    /**
     * Remove service name mapping
     */
    removeServiceMapping(originalName) {
        delete this.serviceNameMapping[originalName];
        this.forceSync();
    }
}
