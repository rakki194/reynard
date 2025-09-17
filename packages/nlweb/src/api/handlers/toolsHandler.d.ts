/**
 * Tools Handler
 *
 * Handles tool management requests for the NLWeb API.
 */
import type { NLWebAPIHandler } from "../types.js";
import type { NLWebService } from "../../types/index.js";
/**
 * Create get tools handler
 */
export declare function createGetToolsHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
/**
 * Create register tool handler
 */
export declare function createRegisterToolHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
/**
 * Create unregister tool handler
 */
export declare function createUnregisterToolHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler;
