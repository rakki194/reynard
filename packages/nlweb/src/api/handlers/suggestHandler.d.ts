/**
 * Suggest Handler
 *
 * Handles tool suggestion requests for the NLWeb API.
 */
import type { NLWebAPIHandler } from "../types.js";
import type { NLWebService } from "../../types/index.js";
/**
 * Create suggest handler
 */
export declare function createSuggestHandler(service: NLWebService, basePath: string, enableCORS: boolean, enableLogging: boolean): NLWebAPIHandler;
