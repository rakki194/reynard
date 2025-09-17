/**
 * NLWeb Core Service
 *
 * Core functionality for the NLWeb service including initialization,
 * health monitoring, and configuration management.
 */
import { NLWebRouter as NLWebRouterImpl } from "../router/NLWebRouter.js";
import { NLWebToolRegistry as NLWebToolRegistryImpl } from "../router/NLWebToolRegistry.js";
import { ToolRegistrationService } from "./ToolRegistrationService.js";
import { NLWebHealthService } from "./NLWebHealthService.js";
import { NLWebInitializationService } from "./NLWebInitializationService.js";
export class NLWebCoreService {
    constructor(configuration, eventEmitter) {
        Object.defineProperty(this, "router", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "toolRegistry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "toolRegistrationService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "healthService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initializationService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "configuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.configuration = configuration;
        this.eventEmitter = eventEmitter;
        this.toolRegistry = new NLWebToolRegistryImpl();
        this.toolRegistrationService = new ToolRegistrationService(this.toolRegistry, eventEmitter);
        this.healthService = new NLWebHealthService(configuration, eventEmitter);
        this.initializationService = new NLWebInitializationService(configuration, eventEmitter);
        this.router = new NLWebRouterImpl(this.toolRegistry, eventEmitter);
    }
    /**
     * Initialize the service
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        await this.initializationService.initialize(this.router, this.toolRegistrationService);
        this.initialized = true;
    }
    /**
     * Get the router instance
     */
    getRouter() {
        return this.router;
    }
    /**
     * Get the tool registry
     */
    getToolRegistry() {
        return this.toolRegistry;
    }
    /**
     * Get service configuration
     */
    getConfiguration() {
        return { ...this.configuration };
    }
    /**
     * Update service configuration
     */
    async updateConfiguration(config) {
        this.configuration = { ...this.configuration, ...config };
        // Reinitialize if configuration changed significantly
        if (config.enabled !== undefined || config.cache || config.performance) {
            await this.router.shutdown();
            await this.router.initialize();
        }
        this.emitEvent("health_check", { status: "configuration_updated" });
    }
    /**
     * Get service health status
     */
    async getHealthStatus() {
        return this.healthService.getHealthStatus(this.router, this.initialized);
    }
    /**
     * Shutdown the service
     */
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        await this.initializationService.shutdown(this.router);
        this.initialized = false;
    }
    /**
     * Get the tool registration service
     */
    getToolRegistrationService() {
        return this.toolRegistrationService;
    }
    /**
     * Emit an event
     */
    emitEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data,
        };
        this.eventEmitter.emit(event);
    }
}
