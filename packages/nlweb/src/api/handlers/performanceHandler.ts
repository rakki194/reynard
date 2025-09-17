/**
 * Performance Handler
 *
 * Handles performance monitoring requests for the NLWeb API.
 */

import type { NLWebAPIRequest, NLWebAPIResponse, NLWebAPIHandler } from "../types.js";
import { NLWebService } from "../../types/index.js";
import { getCORSHeaders } from "../utils.js";

/**
 * Create performance handler
 */
export function createPerformanceHandler(
  service: NLWebService,
  basePath: string,
  enableCORS: boolean
): NLWebAPIHandler {
  return async (_req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
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
        body: { error: "Internal server error" },
      };
    }
  };
}

/**
 * Create rollback handler
 */
export function createRollbackHandler(service: NLWebService, basePath: string, enableCORS: boolean): NLWebAPIHandler {
  return async (req: NLWebAPIRequest): Promise<NLWebAPIResponse> => {
    try {
      if (!req.body || typeof req.body.enable !== "boolean") {
        return {
          status: 400,
          headers: getCORSHeaders(enableCORS),
          body: { error: "Missing or invalid enable parameter" },
        };
      }

      if (req.body.enable) {
        service.getRouter().enableEmergencyRollback();
      } else {
        service.getRouter().disableEmergencyRollback();
      }

      return {
        status: 200,
        headers: getCORSHeaders(enableCORS),
        body: {
          message: `Emergency rollback ${req.body.enable ? "enabled" : "disabled"}`,
        },
      };
    } catch (error) {
      console.error("[NLWeb] Rollback error:", error);
      return {
        status: 500,
        headers: getCORSHeaders(enableCORS),
        body: { error: "Internal server error" },
      };
    }
  };
}
