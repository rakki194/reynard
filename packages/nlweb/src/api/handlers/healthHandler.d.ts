/**
 * Health Handler
 *
 * Handles health check requests for the NLWeb API.
 */
import type { NLWebAPIHandler } from "../types.js";
import type { NLWebService } from "../../types/index.js";
/**
 * Create health handler
 */
export declare function createHealthHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
/**
 * Create status handler
 */
export declare function createStatusHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
/**
 * Create force health check handler
 */
export declare function createForceHealthCheckHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
