/**
 * Suggest Handler
 *
 * Handles tool suggestion requests for the NLWeb API.
 */

import { NLWebAPIRequest, NLWebAPIResponse, NLWebAPIHandler } from "../types.js";
import { NLWebService } from "../../types/index.js";
import { getCORSHeaders } from "../utils.js";

/**
 * Create suggest handler
 */
export function createSuggestHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean,
  enableLogging: boolean,
): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      if (enableLogging) {
        console.log(`[NLWeb] Suggest request: ${JSON.stringify(req.body)}`);
      }

      // Validate request
      if (!req.body || typeof req.body.query !== "string") {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing or invalid query parameter" },
        };
      }

      // Create suggestion request
      const suggestionRequest = {
        query: req.body.query,
        context: req.body.context || {},
        maxSuggestions: req.body.maxSuggestions || 5,
      };

      // Get suggestions from service
      const suggestions = await service.getRouter().suggest(suggestionRequest);

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: suggestions,
      };
    } catch (error) {
      console.error("[NLWeb] Suggest error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: { error: "Internal server error" },
      };
    }
  };
}
