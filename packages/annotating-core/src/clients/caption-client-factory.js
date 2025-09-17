/**
 * Caption Client Factory for Reynard Annotating
 *
 * Factory functions for creating caption API client instances with
 * sensible defaults and configuration validation.
 */
import { CaptionApiClient } from "./caption-api-client.js";
/**
 * Default configuration for caption API client
 */
export const DEFAULT_CAPTION_CONFIG = {
    timeout: 30000,
    retries: 3,
    serviceName: "caption-api",
    version: "1.0.0",
};
/**
 * Create a caption API client instance with default configuration
 */
export function createCaptionApiClient(config) {
    const fullConfig = {
        ...DEFAULT_CAPTION_CONFIG,
        ...config,
    };
    // Validate required configuration
    if (!fullConfig.baseUrl) {
        throw new Error("baseUrl is required for CaptionApiClient");
    }
    return new CaptionApiClient(fullConfig);
}
/**
 * Create a caption API client with health monitoring enabled
 */
export function createCaptionApiClientWithHealth(config, healthCheckInterval = 30000) {
    const client = createCaptionApiClient(config);
    client.startHealthChecks(healthCheckInterval);
    return client;
}
