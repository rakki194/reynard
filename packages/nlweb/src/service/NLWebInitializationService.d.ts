/**
 * NLWeb Initialization Service
 *
 * Handles service initialization and shutdown logic for the NLWeb service.
 */
import type { NLWebConfiguration, NLWebEventEmitter } from "../types/index.js";
import type { NLWebRouter } from "../types/index.js";
import type { ToolRegistrationService } from "./ToolRegistrationService.js";
export declare class NLWebInitializationService {
    private configuration;
    private eventEmitter;
    constructor(configuration: NLWebConfiguration, eventEmitter: NLWebEventEmitter);
    /**
     * Initialize the service
     */
    initialize(router: NLWebRouter, toolRegistrationService: ToolRegistrationService): Promise<void>;
    /**
     * Shutdown the service
     */
    shutdown(router: NLWebRouter): Promise<void>;
    /**
     * Emit an event
     */
    private emitEvent;
}
