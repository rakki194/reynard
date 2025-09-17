/**
 * Base Service Class
 *
 * Abstract base class that all services must extend. Provides common
 * lifecycle management, health monitoring, and metadata handling.
 */
import { ServiceStatus, ServiceHealth, } from "../types/index.js";
export class BaseService {
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
        this._name = config.name;
        this._dependencies = config.dependencies || [];
        this._startupPriority = config.startupPriority || 100;
        this._requiredPackages = config.requiredPackages || [];
        this._autoStart = config.autoStart !== false;
        this._metadata = config.config || {};
    }
    // Getters
    get name() {
        return this._name;
    }
    get status() {
        return this._status;
    }
    get health() {
        return this._health;
    }
    get dependencies() {
        return [...this._dependencies];
    }
    get startupPriority() {
        return this._startupPriority;
    }
    get requiredPackages() {
        return [...this._requiredPackages];
    }
    get autoStart() {
        return this._autoStart;
    }
    get startupTime() {
        return this._startupTime;
    }
    get lastHealthCheck() {
        return this._lastHealthCheck;
    }
    get lastError() {
        return this._lastError;
    }
    get metadata() {
        return { ...this._metadata };
    }
    get isInitialized() {
        return this._isInitialized;
    }
    // Lifecycle methods
    async start() {
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
        }
        catch (error) {
            this._status = ServiceStatus.ERROR;
            this._lastError = error instanceof Error ? error.message : String(error);
            throw error;
        }
    }
    async stop() {
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
        }
        catch (error) {
            this._status = ServiceStatus.ERROR;
            this._lastError = error instanceof Error ? error.message : String(error);
            throw error;
        }
    }
    // Health monitoring
    startHealthMonitoring() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
        }
        this._healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.healthCheck();
                this._health = health;
                this._lastHealthCheck = new Date();
            }
            catch (error) {
                this._health = ServiceHealth.UNHEALTHY;
                this._lastError =
                    error instanceof Error ? error.message : String(error);
                this._lastHealthCheck = new Date();
            }
        }, 30000); // Check every 30 seconds
    }
    stopHealthMonitoring() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
            this._healthCheckInterval = undefined;
        }
    }
    // Dependency and package verification
    async verifyDependencies() {
        // This should be implemented by the service manager
        // For now, we'll just log that dependencies should be verified
        console.debug(`Service ${this._name} dependencies should be verified:`, this._dependencies);
    }
    async verifyRequiredPackages() {
        // This should be implemented by the service manager
        // For now, we'll just log that packages should be verified
        console.debug(`Service ${this._name} required packages should be verified:`, this._requiredPackages);
    }
    // Utility methods
    getInfo() {
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
    getHealthInfo() {
        return {
            status: this._health,
            lastCheck: this._lastHealthCheck || new Date(),
            startupTime: this._startupTime,
            error: this._lastError,
        };
    }
    updateMetadata(metadata) {
        this._metadata = { ...this._metadata, ...metadata };
    }
    // Cleanup
    destroy() {
        this.stopHealthMonitoring();
        this._status = ServiceStatus.STOPPED;
        this._isInitialized = false;
    }
}
