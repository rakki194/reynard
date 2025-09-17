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
export declare const DEFAULT_CAPTION_CONFIG: Partial<CaptionApiClientConfig>;
/**
 * Create a caption API client instance with default configuration
 */
export declare function createCaptionApiClient(config: CaptionApiClientConfig): CaptionApiClient;
/**
 * Create a caption API client with health monitoring enabled
 */
export declare function createCaptionApiClientWithHealth(config: CaptionApiClientConfig, healthCheckInterval?: number): CaptionApiClient;
