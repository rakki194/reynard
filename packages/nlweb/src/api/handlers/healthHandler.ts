/**
 * Health Handler
 *
 * Handles health check requests for the NLWeb API.
 */

import type {
  NLWebAPIRequest,
  NLWebAPIResponse,
  NLWebAPIHandler,
} from "../types.js";
import type { NLWebService } from "../../types/index.js";
import { getCORSHeaders } from "../utils.js";

/**
 * Create health handler
 */
export function createHealthHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean,
): NLWebAPIHandler {
  return async (_req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
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
        body: { error: "Internal server error" },
      };
    }
  };
}

/**
 * Create status handler
 */
export function createStatusHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean,
): NLWebAPIHandler {
  return async (_req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      const healthStatus = await service.getHealthStatus();
      const configuration = service.getConfiguration();
      const toolStats = service.getToolRegistry().getStats();

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: {
          health: healthStatus,
          configuration,
          tools: toolStats,
        },
      };
    } catch (error) {
      console.error("[NLWeb] Status error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: { error: "Internal server error" },
      };
    }
  };
}

/**
 * Create force health check handler
 */
export function createForceHealthCheckHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean,
): NLWebAPIHandler {
  return async (_req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
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
        body: { error: "Internal server error" },
      };
    }
  };
}
