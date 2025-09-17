/**
 * Performance Handler
 *
 * Handles performance monitoring requests for the NLWeb API.
 */
import type { NLWebAPIHandler } from "../types.js";
import { NLWebService } from "../../types/index.js";
/**
 * Create performance handler
 */
export declare function createPerformanceHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
/**
 * Create rollback handler
 */
export declare function createRollbackHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
