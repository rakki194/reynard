/**
 * NLWeb API
 *
 * HTTP API endpoints for the NLWeb assistant tooling and routing system.
 * Provides REST endpoints for tool suggestions, health monitoring, and configuration.
 */
import type { NLWebService } from "../types/index.js";
import type { NLWebAPIHandler } from "./types.js";
export interface NLWebAPIConfig {
    /** Base path for API endpoints */
    basePath?: string;
    /** Whether to enable CORS */
    enableCORS?: boolean;
    /** Authentication middleware */
    auth?: (req: unknown) => Promise<boolean>;
    /** Request logging */
    enableLogging?: boolean;
}
/**
 * Create NLWeb API handlers
 */
export declare function createNLWebAPI(service: NLWebService, config?: NLWebAPIConfig): Record<string, NLWebAPIHandler>;
