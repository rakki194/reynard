/**
 * NLWeb Service
 *
 * Main service facade that orchestrates the NLWeb assistant tooling and routing system.
 * Provides a unified interface for tool suggestion, performance monitoring, and configuration.
 */
import { NLWebCoreService } from "./NLWebCoreService.js";
export class NLWebService {
    constructor(configuration, eventEmitter) {
        Object.defineProperty(this, "coreService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.coreService = new NLWebCoreService(configuration, eventEmitter);
    }
    /**
     * Initialize the service
     */
    async initialize() {
        return this.coreService.initialize();
    }
    /**
     * Get the router instance
     */
    getRouter() {
        return this.coreService.getRouter();
    }
    /**
     * Get the tool registry
     */
    getToolRegistry() {
        return this.coreService.getToolRegistry();
    }
    /**
     * Get service configuration
     */
    getConfiguration() {
        return this.coreService.getConfiguration();
    }
    /**
     * Update service configuration
     */
    async updateConfiguration(config) {
        return this.coreService.updateConfiguration(config);
    }
    /**
     * Get service health status
     */
    async getHealthStatus() {
        return this.coreService.getHealthStatus();
    }
    /**
     * Shutdown the service
     */
    async shutdown() {
        return this.coreService.shutdown();
    }
    /**
     * Get the tool registration service
     */
    getToolRegistrationService() {
        return this.coreService.getToolRegistrationService();
    }
}
// Re-export configuration and event emitter for backward compatibility
export { createDefaultNLWebConfiguration } from "../config/index.js";
export { SimpleEventEmitter } from "../events/index.js";
