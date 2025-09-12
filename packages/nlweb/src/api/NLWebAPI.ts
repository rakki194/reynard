/**
 * NLWeb API
 *
 * HTTP API endpoints for the NLWeb assistant tooling and routing system.
 * Provides REST endpoints for tool suggestions, health monitoring, and configuration.
 */

import {
  NLWebService,
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
  NLWebHealthStatus,
  NLWebConfiguration,
  NLWebTool,
  NLWebEvent,
  NLWebEventEmitter,
} from "../types/index.js";

export interface NLWebAPIConfig {
  /** Base path for API endpoints */
  basePath?: string;
  /** Whether to enable CORS */
  enableCORS?: boolean;
  /** Authentication middleware */
  auth?: (req: any) => Promise<boolean>;
  /** Request logging */
  enableLogging?: boolean;
}

export interface NLWebAPIRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface NLWebAPIResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export interface NLWebAPIHandler {
  (req: NLWebAPIRequest): Promise<NLWebAPIResponse>;
}

/**
 * Create NLWeb API handlers
 */
export function createNLWebAPI(
  service: NLWebService,
  config: NLWebAPIConfig = {},
): Record<string, NLWebAPIHandler> {
  const {
    basePath = "/api/nlweb",
    enableCORS = true,
    auth,
    enableLogging = true,
  } = config;

  const handlers: Record<string, NLWebAPIHandler> = {};

  /**
   * POST /api/nlweb/suggest - Get tool suggestions
   */
  handlers[`POST ${basePath}/suggest`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
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
      const suggestionRequest: NLWebSuggestionRequest = {
        query: {
          text: req.body.query,
          context: req.body.context || {},
          maxSuggestions: req.body.maxSuggestions || 3,
          minScore: req.body.minScore || 30,
          includeReasoning: req.body.includeReasoning || false,
        },
        metadata: {
          requestId: req.headers["x-request-id"] || generateRequestId(),
          timestamp: Date.now(),
          source: req.headers["user-agent"] || "unknown",
        },
      };

      // Get suggestions
      const response = await service.getRouter().suggest(suggestionRequest);

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: response,
      };
    } catch (error) {
      console.error("[NLWeb] Suggest error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * GET /api/nlweb/status - Get service status
   */
  handlers[`GET ${basePath}/status`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      const healthStatus = await service.getHealthStatus();
      const configuration = service.getConfiguration();
      const toolStats = service.getToolRegistry().getStats();

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: {
          health: healthStatus,
          configuration: {
            enabled: configuration.enabled,
            canaryEnabled: configuration.canary.enabled,
            canaryPercentage: configuration.canary.percentage,
            rollbackEnabled: configuration.rollback.enabled,
            performanceMonitoring: configuration.performance.enabled,
          },
          tools: toolStats,
        },
      };
    } catch (error) {
      console.error("[NLWeb] Status error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * GET /api/nlweb/health - Get health status
   */
  handlers[`GET ${basePath}/health`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      const healthStatus = await service.getHealthStatus();

      return {
        status: healthStatus.status === "healthy" ? 200 : 503,
        headers: getCORSHeaders(enableCORS),
        body: healthStatus,
      };
    } catch (error) {
      console.error("[NLWeb] Health error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * POST /api/nlweb/health/force-check - Force health check
   */
  handlers[`POST ${basePath}/health/force-check`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      const healthStatus = await service.getRouter().forceHealthCheck();

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: healthStatus,
      };
    } catch (error) {
      console.error("[NLWeb] Force health check error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * GET /api/nlweb/tools - Get registered tools
   */
  handlers[`GET ${basePath}/tools`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      const category = req.query?.category;
      const tags = req.query?.tags?.split(",");

      let tools: NLWebTool[];
      if (category) {
        tools = service.getToolRegistry().getToolsByCategory(category);
      } else if (tags && tags.length > 0) {
        tools = service.getToolRegistry().getToolsByTags(tags);
      } else {
        tools = service.getToolRegistry().getAllTools();
      }

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: {
          tools,
          count: tools.length,
          stats: service.getToolRegistry().getStats(),
        },
      };
    } catch (error) {
      console.error("[NLWeb] Tools error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * POST /api/nlweb/tools - Register a new tool
   */
  handlers[`POST ${basePath}/tools`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      if (!req.body || !req.body.name) {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing tool name" },
        };
      }

      const tool: NLWebTool = req.body;
      service.getToolRegistry().register(tool);

      return {
        status: 201,
        headers: getCORSHeaders(enableCORS),
        body: {
          message: "Tool registered successfully",
          tool: tool.name,
        },
      };
    } catch (error) {
      console.error("[NLWeb] Register tool error:", error);
      return {
        status: 400,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Invalid tool definition",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * DELETE /api/nlweb/tools/:name - Unregister a tool
   */
  handlers[`DELETE ${basePath}/tools/:name`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      const toolName = req.url.split("/").pop();
      if (!toolName) {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing tool name" },
        };
      }

      service.getToolRegistry().unregister(toolName);

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: {
          message: "Tool unregistered successfully",
          tool: toolName,
        },
      };
    } catch (error) {
      console.error("[NLWeb] Unregister tool error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * GET /api/nlweb/performance - Get performance statistics
   */
  handlers[`GET ${basePath}/performance`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      const performanceStats = service.getRouter().getPerformanceStats();

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: performanceStats,
      };
    } catch (error) {
      console.error("[NLWeb] Performance error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  /**
   * POST /api/nlweb/rollback - Enable/disable emergency rollback
   */
  handlers[`POST ${basePath}/rollback`] = async (
    req: NLWebAPIRequest,
  ): Promise<NLWebAPIResponse> => {
    try {
      if (!req.body || typeof req.body.enable !== "boolean") {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing or invalid enable parameter" },
        };
      }

      const config = service.getConfiguration();
      config.rollback.enabled = req.body.enable;
      config.rollback.reason = req.body.reason || "Manual rollback";

      await service.updateConfiguration(config);

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: {
          message: `Rollback ${req.body.enable ? "enabled" : "disabled"}`,
          rollbackEnabled: req.body.enable,
          reason: config.rollback.reason,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error("[NLWeb] Rollback error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  return handlers;
}

/**
 * Get CORS headers
 */
function getCORSHeaders(enableCORS: boolean): Record<string, string> {
  if (!enableCORS) {
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
