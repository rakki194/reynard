/**
 * Caption API Clients for Reynard Annotating
 *
 * Provides specialized API clients for caption generation operations.
 * Built on top of the core HTTP client infrastructure.
 */
// Export the caption API client
export { CaptionApiClient } from "./caption-api-client.js";
export { createCaptionApiClient, createCaptionApiClientWithHealth, DEFAULT_CAPTION_CONFIG, } from "./caption-client-factory.js";
// Export all caption types
export * from "./caption-types.js";
