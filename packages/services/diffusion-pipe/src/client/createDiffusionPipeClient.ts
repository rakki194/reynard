/**
 * 🦊 Diffusion-Pipe Client Factory
 *
 * Factory function to create configured diffusion-pipe clients
 * with sensible defaults and environment-based configuration.
 */

import { DiffusionPipeClient } from "./DiffusionPipeClient";
import { DiffusionPipeConfig } from "./DiffusionPipeConfig";

/**
 * Create a diffusion-pipe client with default configuration
 */
export function createDiffusionPipeClient(config: Partial<DiffusionPipeConfig> = {}): DiffusionPipeClient {
  // Get configuration from environment variables
  const envConfig: Partial<DiffusionPipeConfig> = {
    baseUrl: process.env.DIFFUSION_PIPE_API_URL || "http://localhost:8000",
    apiKey: process.env.DIFFUSION_PIPE_API_KEY,
    bearerToken: process.env.DIFFUSION_PIPE_BEARER_TOKEN,
    timeout: process.env.DIFFUSION_PIPE_TIMEOUT ? parseInt(process.env.DIFFUSION_PIPE_TIMEOUT, 10) : undefined,
    enableLogging: process.env.DIFFUSION_PIPE_LOGGING === "true",
  };

  // Merge environment config with provided config
  const finalConfig = { ...envConfig, ...config };

  return new DiffusionPipeClient(finalConfig);
}

/**
 * Create a client for development/testing
 */
export function createDevClient(): DiffusionPipeClient {
  return createDiffusionPipeClient({
    baseUrl: "http://localhost:8000",
    enableLogging: true,
    timeout: 10000,
  });
}

/**
 * Create a client for production
 */
export function createProdClient(): DiffusionPipeClient {
  return createDiffusionPipeClient({
    baseUrl: process.env.DIFFUSION_PIPE_API_URL || "https://api.reynard.dev",
    enableLogging: false,
    timeout: 30000,
    maxRetries: 5,
    retryDelay: 2000,
  });
}
