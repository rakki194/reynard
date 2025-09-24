/**
 * HTTP Client Presets
 *
 * Pre-configured HTTP client settings for common use cases.
 */

import { HTTPClientConfig } from "./types";

export const HTTP_PRESETS: Record<string, { config: Partial<HTTPClientConfig>; description: string }> = {
  default: {
    description: "Standard HTTP client with balanced settings",
    config: {
      baseUrl: "",
      timeout: 30000,
      retries: 3,
      enableRetry: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
    },
  },
  fast: {
    description: "Fast HTTP client with minimal retries and short timeouts",
    config: {
      baseUrl: "",
      timeout: 10000,
      retries: 1,
      enableRetry: true,
      enableCircuitBreaker: false,
      enableMetrics: false,
    },
  },
  reliable: {
    description: "Reliable HTTP client with extensive retries and circuit breaker",
    config: {
      baseUrl: "",
      timeout: 60000,
      retries: 5,
      enableRetry: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
    },
  },
  api: {
    description: "API client optimized for REST API calls",
    config: {
      baseUrl: "",
      timeout: 30000,
      retries: 3,
      enableRetry: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  },
  upload: {
    description: "Upload client with extended timeouts for file uploads",
    config: {
      baseUrl: "",
      timeout: 300000, // 5 minutes
      retries: 2,
      enableRetry: true,
      enableCircuitBreaker: false,
      enableMetrics: true,
    },
  },
  download: {
    description: "Download client optimized for file downloads",
    config: {
      baseUrl: "",
      timeout: 600000, // 10 minutes
      retries: 2,
      enableRetry: true,
      enableCircuitBreaker: false,
      enableMetrics: true,
    },
  },
  testing: {
    description: "Testing client with minimal features for unit tests",
    config: {
      baseUrl: "",
      timeout: 5000,
      retries: 0,
      enableRetry: false,
      enableCircuitBreaker: false,
      enableMetrics: false,
    },
  },
};
