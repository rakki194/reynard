/**
 * Suggest Handler
 *
 * Handles tool suggestion requests for the NLWeb API.
 */

import type {
  NLWebAPIRequest,
  NLWebAPIResponse,
  NLWebAPIHandler,
} from "../types.js";
import type { NLWebService } from "../../types/index.js";
import { getCORSHeaders } from "../utils.js";

/**
 * Type guard to check if request body has the expected structure
 */
function isValidSuggestRequestBody(body: unknown): body is {
  query: string;
  context?: Record<string, unknown>;
  maxSuggestions?: number;
} {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).query === "string"
  );
}

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
      if (!isValidSuggestRequestBody(req.body)) {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing or invalid query parameter" },
        };
      }

      // TypeScript now knows req.body has the correct structure
      const body = req.body;

      // Create suggestion request
      const suggestionRequest = {
        query: body.query,
        context: body.context || {},
        maxSuggestions: body.maxSuggestions || 5,
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
