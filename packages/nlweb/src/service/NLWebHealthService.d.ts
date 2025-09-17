/**
 * NLWeb Health Service
 *
 * Handles health monitoring and status reporting for the NLWeb service.
 */
import type { NLWebHealthStatus, NLWebConfiguration, NLWebEventEmitter } from "../types/index.js";
import type { NLWebRouter } from "../types/index.js";
export declare class NLWebHealthService {
    private configuration;
    private eventEmitter;
    constructor(configuration: NLWebConfiguration, eventEmitter: NLWebEventEmitter);
    /**
     * Get service health status
     */
    getHealthStatus(router: NLWebRouter, initialized: boolean): Promise<NLWebHealthStatus>;
    /**
     * Get unhealthy status when service is not initialized
     */
    private getUnhealthyStatus;
    /**
     * Emit an event
     */
    private emitEvent;
}
