/**
 * Tools Handler
 *
 * Handles tool management requests for the NLWeb API.
 */

import type { NLWebAPIRequest, NLWebAPIResponse, NLWebAPIHandler } from "../types.js";
import type { NLWebService, NLWebTool } from "../../types/index.js";
import { getCORSHeaders } from "../utils.js";

/**
 * Type guard to check if request body has the expected NLWebTool structure
 */
function isValidToolRequestBody(body: unknown): body is NLWebTool {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const obj = body as Record<string, unknown>;

  return (
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    typeof obj.category === "string" &&
    Array.isArray(obj.tags) &&
    typeof obj.path === "string" &&
    ["GET", "POST", "PUT", "DELETE"].includes(obj.method as string) &&
    Array.isArray(obj.parameters) &&
    Array.isArray(obj.examples) &&
    typeof obj.enabled === "boolean" &&
    typeof obj.priority === "number" &&
    typeof obj.timeout === "number"
  );
}

/**
 * Create get tools handler
 */
export function createGetToolsHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      const category = req.query?.category;
      const tags = req.query?.tags?.split(",");

      let tools = service.getToolRegistry().getAllTools();

      // Filter by category if specified
      if (category) {
        tools = tools.filter(tool => tool.category === category);
      }

      // Filter by tags if specified
      if (tags && tags.length > 0) {
        tools = tools.filter(tool => tags.some(tag => tool.tags?.includes(tag)));
      }

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: { tools },
      };
    } catch (error) {
      console.error("[NLWeb] Get tools error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: { error: "Internal server error" },
      };
    }
  };
}

/**
 * Create register tool handler
 */
export function createRegisterToolHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean
): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      if (!isValidToolRequestBody(req.body)) {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing tool name" },
        };
      }

      // TypeScript now knows req.body has the correct structure
      const tool = req.body;
      service.getToolRegistry().registerTool(tool);

      return {
        status: 201,
        headers: getCORSHeaders(enableCORS),
        body: { message: "Tool registered successfully", tool },
      };
    } catch (error) {
      console.error("[NLWeb] Register tool error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: { error: "Internal server error" },
      };
    }
  };
}

/**
 * Create unregister tool handler
 */
export function createUnregisterToolHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean
): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      const toolName = req.url.split("/").pop();
      if (!toolName) {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing tool name" },
        };
      }

      const success = service.getToolRegistry().unregisterTool(toolName);
      if (!success) {
        return {
          status: 404,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Tool not found" },
        };
      }

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: { message: "Tool unregistered successfully" },
      };
    } catch (error) {
      console.error("[NLWeb] Unregister tool error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: { error: "Internal server error" },
      };
    }
  };
}
