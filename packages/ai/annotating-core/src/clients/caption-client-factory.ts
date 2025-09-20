/**
 * Caption Client Factory for Reynard Annotating
 *
 * Factory functions for creating caption API client instances with
 * sensible defaults and configuration validation.
 */

import { CaptionApiClient } from "./caption-api-client.js";
import { CaptionApiClientConfig } from "./caption-types.js";

/**
 * Default configuration for caption API client
 */
export const DEFAULT_CAPTION_CONFIG: Partial<CaptionApiClientConfig> = {
  timeout: 30000,
  retries: 3,
  serviceName: "caption-api",
  version: "1.0.0",
};

/**
 * Create a caption API client instance with default configuration
 */
export function createCaptionApiClient(config: CaptionApiClientConfig): CaptionApiClient {
  const fullConfig: CaptionApiClientConfig = {
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
export function createCaptionApiClientWithHealth(
  config: CaptionApiClientConfig,
  healthCheckInterval: number = 30000
): CaptionApiClient {
  const client = createCaptionApiClient(config);
  client.startHealthChecks(healthCheckInterval);
  return client;
}
