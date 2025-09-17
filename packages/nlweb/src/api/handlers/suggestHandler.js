/**
 * Suggest Handler
 *
 * Handles tool suggestion requests for the NLWeb API.
 */
import { getCORSHeaders } from "../utils.js";
/**
 * Type guard to check if request body has the expected structure
 */
function isValidSuggestRequestBody(body) {
    return (typeof body === "object" &&
        body !== null &&
        typeof body.query === "string");
}
/**
 * Create suggest handler
 */
export function createSuggestHandler(service, basePath, enableCORS, enableLogging) {
    return async (req) => {
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
        }
        catch (error) {
            console.error("[NLWeb] Suggest error:", error);
            return {
                status: 500,
                headers: getCORSHeaders(enableCORS),
                body: { error: "Internal server error" },
            };
        }
    };
}
