/**
 * Service Manager
 *
 * Main orchestrator for service lifecycle management, dependency resolution,
 * and health monitoring.
 */
import { ServiceRegistry } from "./ServiceRegistry.js";
import { DependencyGraph } from "./DependencyGraph.js";
import { ServiceStatus, ServiceHealth, } from "../types/index.js";
export class ServiceManager {
    constructor(config = {}) {
        Object.defineProperty(this, "_services", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ServiceRegistry()
        });
        Object.defineProperty(this, "_dependencyGraph", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DependencyGraph()
        });
        Object.defineProperty(this, "_config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_eventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_startupTasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_isStarting", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isShuttingDown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_startupTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_totalStartupTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    registerService(service) {
        if (this._services.has(service.name)) {
            console.warn(`Service '${service.name}' already registered, overwriting`);
        }
        this._services.set(service.name, service);
        // Add to dependency graph
        this._dependencyGraph.addService(service.name, service.dependencies, service.startupPriority, service.requiredPackages);
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
    registerServices(services) {
        for (const service of services) {
            this.registerService(service);
        }
    }
    unregisterService(name) {
        const service = this._services.get(name);
        if (service) {
            service.destroy();
            this._services.delete(name);
            this._dependencyGraph.removeService(name);
            this._registry.unregister(name);
        }
    }
    // Service access
    getService(name) {
        return this._services.get(name);
    }
    getServices() {
        return new Map(this._services);
    }
    getServiceInfo(name) {
        const service = this._services.get(name);
        return service?.getInfo();
    }
    getAllServiceInfo() {
        const result = {};
        for (const [name, service] of this._services) {
            result[name] = service.getInfo();
        }
        return result;
    }
    // Lifecycle management
    async startServices() {
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
                const groupPromises = group.map((serviceName) => this._startService(serviceName));
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
        }
        catch (error) {
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
        }
        finally {
            this._isStarting = false;
        }
    }
    async stopServices() {
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
        }
        finally {
            this._isShuttingDown = false;
        }
    }
    // Individual service control
    async startService(name) {
        await this._startService(name);
    }
    async stopService(name) {
        await this._stopService(name);
    }
    async _startService(name) {
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
        }
        finally {
            this._startupTasks.delete(name);
        }
    }
    async _performServiceStartup(name, service) {
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
        }
        catch (error) {
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
    async _stopService(name) {
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
        }
        catch (error) {
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
    getState() {
        const services = {};
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
    _getStartupProgress() {
        const progress = {};
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
    addEventListener(handler) {
        this._eventHandlers.add(handler);
    }
    removeEventListener(handler) {
        this._eventHandlers.delete(handler);
    }
    _emitEvent(event) {
        for (const handler of this._eventHandlers) {
            try {
                handler(event);
            }
            catch (error) {
                console.error("Error in service event handler:", error);
            }
        }
    }
    // Utility methods
    isServiceRunning(name) {
        const service = this._services.get(name);
        return service?.status === ServiceStatus.RUNNING;
    }
    isServiceHealthy(name) {
        const service = this._services.get(name);
        return service?.health === ServiceHealth.HEALTHY;
    }
    getServiceHealth(name) {
        const service = this._services.get(name);
        return service?.health;
    }
    // Cleanup
    destroy() {
        this.stopServices();
        for (const service of this._services.values()) {
            service.destroy();
        }
        this._services.clear();
        this._registry.clear();
        this._eventHandlers.clear();
    }
}
