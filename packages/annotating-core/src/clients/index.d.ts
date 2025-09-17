/**
 * Caption API Clients for Reynard Annotating
 *
 * Provides specialized API clients for caption generation operations.
 * Built on top of the core HTTP client infrastructure.
 */
export { CaptionApiClient } from "./caption-api-client.js";
export { createCaptionApiClient, createCaptionApiClientWithHealth, DEFAULT_CAPTION_CONFIG, } from "./caption-client-factory.js";
export * from "./caption-types.js";
