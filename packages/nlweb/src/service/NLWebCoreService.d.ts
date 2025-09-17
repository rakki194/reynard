/**
 * NLWeb Core Service
 *
 * Core functionality for the NLWeb service including initialization,
 * health monitoring, and configuration management.
 */
import type { NLWebService as INLWebService, NLWebRouter, NLWebConfiguration, NLWebHealthStatus, NLWebEventEmitter } from "../types/index.js";
import type { NLWebToolRegistry } from "../router/NLWebToolRegistry.js";
import { ToolRegistrationService } from "./ToolRegistrationService.js";
export declare class NLWebCoreService implements INLWebService {
    private router;
    private toolRegistry;
    private toolRegistrationService;
    private healthService;
    private initializationService;
    private configuration;
    private eventEmitter;
    private initialized;
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
    /**
     * Emit an event
     */
    private emitEvent;
}
