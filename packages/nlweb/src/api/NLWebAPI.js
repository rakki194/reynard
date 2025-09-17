/**
 * NLWeb API
 *
 * HTTP API endpoints for the NLWeb assistant tooling and routing system.
 * Provides REST endpoints for tool suggestions, health monitoring, and configuration.
 */
import { createSuggestHandler } from "./handlers/suggestHandler.js";
import { createHealthHandler, createStatusHandler, createForceHealthCheckHandler, } from "./handlers/healthHandler.js";
import { createGetToolsHandler, createRegisterToolHandler, createUnregisterToolHandler, } from "./handlers/toolsHandler.js";
import { createPerformanceHandler, createRollbackHandler, } from "./handlers/performanceHandler.js";
/**
 * Register core handlers
 */
function registerCoreHandlers(handlers, service, basePath, enableCORS, enableLogging) {
    handlers[`POST ${basePath}/suggest`] = createSuggestHandler(service, basePath, enableCORS, enableLogging);
    handlers[`GET ${basePath}/status`] = createStatusHandler(service, basePath, enableCORS);
    handlers[`GET ${basePath}/health`] = createHealthHandler(service, basePath, enableCORS);
    handlers[`POST ${basePath}/health/force-check`] =
        createForceHealthCheckHandler(service, basePath, enableCORS);
}
/**
 * Register tool handlers
 */
function registerToolHandlers(handlers, service, basePath, enableCORS) {
    handlers[`GET ${basePath}/tools`] = createGetToolsHandler(service, basePath, enableCORS);
    handlers[`POST ${basePath}/tools`] = createRegisterToolHandler(service, basePath, enableCORS);
    handlers[`DELETE ${basePath}/tools/:name`] = createUnregisterToolHandler(service, basePath, enableCORS);
}
/**
 * Register performance handlers
 */
function registerPerformanceHandlers(handlers, service, basePath, enableCORS) {
    handlers[`GET ${basePath}/performance`] = createPerformanceHandler(service, basePath, enableCORS);
    handlers[`POST ${basePath}/rollback`] = createRollbackHandler(service, basePath, enableCORS);
}
/**
 * Create NLWeb API handlers
 */
export function createNLWebAPI(service, config = {}) {
    const { basePath = "/api/nlweb", enableCORS = true, auth: _auth, enableLogging = true, } = config;
    const handlers = {};
    registerCoreHandlers(handlers, service, basePath, enableCORS, enableLogging);
    registerToolHandlers(handlers, service, basePath, enableCORS);
    registerPerformanceHandlers(handlers, service, basePath, enableCORS);
    return handlers;
}
