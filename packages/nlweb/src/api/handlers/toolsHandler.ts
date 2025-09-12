/**
 * Tools Handler
 *
 * Handles tool management requests for the NLWeb API.
 */

import { NLWebAPIRequest, NLWebAPIResponse, NLWebAPIHandler } from "../types.js";
import { NLWebService } from "../../types/index.js";
import { getCORSHeaders } from "../utils.js";

/**
 * Create get tools handler
 */
export function createGetToolsHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean,
): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      const category = req.query?.category;
      const tags = req.query?.tags?.split(",");

      let tools = service.getToolRegistry().getAllTools();

      // Filter by category if specified
      if (category) {
        tools = tools.filter((tool) => tool.category === category);
      }

      // Filter by tags if specified
      if (tags && tags.length > 0) {
        tools = tools.filter((tool) =>
          tags.some((tag) => tool.tags?.includes(tag)),
        );
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
  enableCORS: boolean,
): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      if (!req.body || !req.body.name) {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing tool name" },
        };
      }

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
  enableCORS: boolean,
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
