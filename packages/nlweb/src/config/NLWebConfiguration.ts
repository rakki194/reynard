/**
 * NLWeb Configuration Factory
 * 
 * Provides default configuration creation for the NLWeb service.
 */

import type { NLWebConfiguration } from "../types/index.js";

/**
 * Create a default NLWeb configuration
 */
export function createDefaultNLWebConfiguration(): NLWebConfiguration {
  return {
    enabled: true,
    configDir: "./config/nlweb",
    cache: {
      ttl: 600, // 10 minutes
      maxEntries: 1000,
      allowStaleOnError: true,
    },
    performance: {
      enabled: true,
      suggestionTimeout: 1500, // 1.5 seconds
      maxSuggestions: 3,
      minScore: 30,
    },
    rateLimit: {
      requestsPerMinute: 60,
      windowSeconds: 60,
    },
    canary: {
      enabled: false,
      percentage: 5.0,
    },
    rollback: {
      enabled: false,
    },
  };
}
