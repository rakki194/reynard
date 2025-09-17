/**
 * NLWeb Service
 *
 * Main service facade that orchestrates the NLWeb assistant tooling and routing system.
 * Provides a unified interface for tool suggestion, performance monitoring, and configuration.
 */
import type { NLWebService as INLWebService, NLWebRouter, NLWebConfiguration, NLWebHealthStatus, NLWebEventEmitter } from "../types/index.js";
import type { NLWebToolRegistry } from "../router/NLWebToolRegistry.js";
import { ToolRegistrationService } from "./ToolRegistrationService.js";
export declare class NLWebService implements INLWebService {
    private coreService;
    constructor(configuration: NLWebConfiguration, eventEmitter: NLWebEventEmitter);
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Get the router instance
     */
    getRouter(): NLWebRouter;
    /**
     * Get the tool registry
     */
    getToolRegistry(): NLWebToolRegistry;
    /**
     * Get service configuration
     */
    getConfiguration(): NLWebConfiguration;
    /**
     * Update service configuration
     */
    updateConfiguration(config: Partial<NLWebConfiguration>): Promise<void>;
    /**
     * Get service health status
     */
    getHealthStatus(): Promise<NLWebHealthStatus>;
    /**
     * Shutdown the service
     */
    shutdown(): Promise<void>;
    /**
     * Get the tool registration service
     */
    getToolRegistrationService(): ToolRegistrationService;
}
export { createDefaultNLWebConfiguration } from "../config/index.js";
export { SimpleEventEmitter } from "../events/index.js";
