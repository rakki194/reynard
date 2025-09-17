/**
 * Shared AI/ML Services for Reynard
 *
 * This module provides base service classes and interfaces that all AI/ML
 * services in the Reynard framework should extend. These classes provide
 * common functionality for lifecycle management, health monitoring, and
 * service coordination.
 */
import { ServiceError, ServiceHealth, ServiceStatus, } from "../types/index.js";
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
export class BaseAIService {
    constructor(config) {
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ServiceStatus.STOPPED
        });
        Object.defineProperty(this, "_health", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ServiceHealth.UNKNOWN
        });
        Object.defineProperty(this, "_dependencies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_startupPriority", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "_requiredPackages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_autoStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_startupTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_lastHealthCheck", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_lastError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_healthCheckInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_healthCheckCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_shutdownCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_initializationCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._name = config.name;
        this._dependencies = config.dependencies || [];
        this._startupPriority = config.startupPriority || 100;
        this._requiredPackages = config.requiredPackages || [];
        this._autoStart = config.autoStart !== false;
        this._metadata = config.config || {};
    }
    // ========================================================================
    // Public Interface
    // ========================================================================
    /**
     * Get the service name
     */
    get name() {
        return this._name;
    }
    /**
     * Get the current service status
     */
    get status() {
        return this._status;
    }
    /**
     * Get the current service health
     */
    get health() {
        return this._health;
    }
    /**
     * Get service dependencies
     */
    get dependencies() {
        return [...this._dependencies];
    }
    /**
     * Get startup priority (lower = higher priority)
     */
    get startupPriority() {
        return this._startupPriority;
    }
    /**
     * Get required packages
     */
    get requiredPackages() {
        return [...this._requiredPackages];
    }
    /**
     * Check if service should auto-start
     */
    get autoStart() {
        return this._autoStart;
    }
    /**
     * Check if service is initialized
     */
    get isInitialized() {
        return this._isInitialized;
    }
    /**
     * Get service metadata
     */
    get metadata() {
        return { ...this._metadata };
    }
    /**
     * Get startup time
     */
    get startupTime() {
        return this._startupTime;
    }
    /**
     * Get last health check time
     */
    get lastHealthCheck() {
        return this._lastHealthCheck;
    }
    /**
     * Get last error message
     */
    get lastError() {
        return this._lastError;
    }
    // ========================================================================
    // Lifecycle Management
    // ========================================================================
    /**
     * Start the service
     */
    async start() {
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
        }
        catch (error) {
            this._status = ServiceStatus.ERROR;
            this._health = ServiceHealth.UNHEALTHY;
            this._lastError = error instanceof Error ? error.message : String(error);
            throw new ServiceError(`Failed to start service ${this._name}: ${this._lastError}`, this._name, { error });
        }
    }
    /**
     * Stop the service
     */
    async stop() {
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
        }
        catch (error) {
            this._status = ServiceStatus.ERROR;
            this._health = ServiceHealth.UNHEALTHY;
            this._lastError = error instanceof Error ? error.message : String(error);
            throw new ServiceError(`Failed to stop service ${this._name}: ${this._lastError}`, this._name, { error });
        }
    }
    /**
     * Restart the service
     */
    async restart() {
        await this.stop();
        await this.start();
    }
    // ========================================================================
    // Health Monitoring
    // ========================================================================
    /**
     * Set up automatic health monitoring
     */
    _setupHealthMonitoring() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
        }
        this._healthCheckInterval = setInterval(async () => {
            try {
                const healthInfo = await this.healthCheck();
                this._health = healthInfo.health;
                this._lastHealthCheck = new Date();
                this._lastError = undefined;
            }
            catch (error) {
                this._health = ServiceHealth.UNHEALTHY;
                this._lastError = error instanceof Error ? error.message : String(error);
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Stop health monitoring
     */
    _stopHealthMonitoring() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
            this._healthCheckInterval = undefined;
        }
    }
    /**
     * Get comprehensive service information
     */
    async getServiceInfo() {
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
    updateConfig(config) {
        this._metadata = { ...this._metadata, ...config };
    }
    /**
     * Get service configuration
     */
    getConfig() {
        return { ...this._metadata };
    }
    /**
     * Get a specific configuration value
     */
    getConfigValue(key) {
        return this._metadata[key];
    }
    /**
     * Set a specific configuration value
     */
    setConfigValue(key, value) {
        this._metadata[key] = value;
    }
    // ========================================================================
    // Callback Management
    // ========================================================================
    /**
     * Set health check callback
     */
    setHealthCheckCallback(callback) {
        this._healthCheckCallback = callback;
    }
    /**
     * Set shutdown callback
     */
    setShutdownCallback(callback) {
        this._shutdownCallback = callback;
    }
    /**
     * Set initialization callback
     */
    setInitializationCallback(callback) {
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
    constructor() {
        Object.defineProperty(this, "_services", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_startupOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    /**
     * Register a service
     */
    register(service) {
        this._services.set(service.name, service);
        this._updateStartupOrder();
    }
    /**
     * Unregister a service
     */
    unregister(serviceName) {
        this._services.delete(serviceName);
        this._updateStartupOrder();
    }
    /**
     * Get a service by name
     */
    get(serviceName) {
        return this._services.get(serviceName);
    }
    /**
     * Get all registered services
     */
    getAll() {
        return Array.from(this._services.values());
    }
    /**
     * Get services in startup order
     */
    getStartupOrder() {
        return [...this._startupOrder];
    }
    /**
     * Check if a service is registered
     */
    has(serviceName) {
        return this._services.has(serviceName);
    }
    /**
     * Get service count
     */
    get count() {
        return this._services.size;
    }
    /**
     * Update startup order based on dependencies and priorities
     */
    _updateStartupOrder() {
        const services = Array.from(this._services.values());
        // Sort by startup priority (lower = higher priority)
        services.sort((a, b) => a.startupPriority - b.startupPriority);
        // TODO: Implement dependency resolution for proper startup order
        this._startupOrder = services.map(service => service.name);
    }
    /**
     * Start all services in order
     */
    async startAll() {
        for (const serviceName of this._startupOrder) {
            const service = this._services.get(serviceName);
            if (service && service.autoStart) {
                try {
                    await service.start();
                }
                catch (error) {
                    console.error(`Failed to start service ${serviceName}:`, error);
                }
            }
        }
    }
    /**
     * Stop all services in reverse order
     */
    async stopAll() {
        for (const serviceName of this._startupOrder.reverse()) {
            const service = this._services.get(serviceName);
            if (service) {
                try {
                    await service.stop();
                }
                catch (error) {
                    console.error(`Failed to stop service ${serviceName}:`, error);
                }
            }
        }
    }
}
// ============================================================================
// Global Service Registry Instance
// ============================================================================
let globalServiceRegistry = null;
/**
 * Get the global service registry instance
 */
export function getServiceRegistry() {
    if (!globalServiceRegistry) {
        globalServiceRegistry = new ServiceRegistry();
    }
    return globalServiceRegistry;
}
/**
 * Reset the global service registry (mainly for testing)
 */
export function resetServiceRegistry() {
    globalServiceRegistry = null;
}
// ============================================================================
// Export all services
// ============================================================================
