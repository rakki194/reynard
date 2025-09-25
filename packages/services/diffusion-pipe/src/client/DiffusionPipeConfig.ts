/**
 * 🦊 Diffusion-Pipe Client Configuration
 *
 * Configuration options for the diffusion-pipe API client
 * with authentication, rate limiting, and connection settings.
 */

export interface DiffusionPipeConfig {
  /**
   * Base URL for the diffusion-pipe API
   */
  baseUrl: string;

  /**
   * API key for authentication
   */
  apiKey?: string;

  /**
   * Bearer token for authentication
   */
  bearerToken?: string;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Retry delay in milliseconds
   */
  retryDelay?: number;

  /**
   * Enable request/response logging
   */
  enableLogging?: boolean;

  /**
   * Custom headers to include with requests
   */
  headers?: Record<string, string>;

  /**
   * WebSocket configuration
   */
  websocket?: {
    /**
     * WebSocket URL (defaults to baseUrl with ws:// or wss://)
     */
    url?: string;

    /**
     * Connection timeout in milliseconds
     */
    timeout?: number;

    /**
     * Reconnection attempts
     */
    maxReconnectAttempts?: number;

    /**
     * Reconnection delay in milliseconds
     */
    reconnectDelay?: number;

    /**
     * Heartbeat interval in milliseconds
     */
    heartbeatInterval?: number;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<DiffusionPipeConfig> = {
  baseUrl: "http://localhost:8000",
  apiKey: "",
  bearerToken: "",
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  enableLogging: false,
  headers: {},
  websocket: {
    url: "",
    timeout: 10000,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
    heartbeatInterval: 30000,
  },
};

/**
 * Create a configuration object with defaults
 */
export function createConfig(config: Partial<DiffusionPipeConfig> = {}): Required<DiffusionPipeConfig> {
  const merged = { ...DEFAULT_CONFIG, ...config };

  // Set default WebSocket URL if not provided
  if (!merged.websocket.url) {
    const wsProtocol = merged.baseUrl.startsWith("https") ? "wss" : "ws";
    const wsHost = merged.baseUrl.replace(/^https?:\/\//, "");
    merged.websocket.url = `${wsProtocol}://${wsHost}/ws/diffusion-pipe`;
  }

  return merged;
}

/**
 * Validate configuration
 */
export function validateConfig(config: Partial<DiffusionPipeConfig>): string[] {
  const errors: string[] = [];

  if (!config.baseUrl) {
    errors.push("baseUrl is required");
  } else if (!config.baseUrl.startsWith("http")) {
    errors.push("baseUrl must start with http:// or https://");
  }

  if (config.timeout !== undefined && config.timeout <= 0) {
    errors.push("timeout must be positive");
  }

  if (config.maxRetries !== undefined && config.maxRetries < 0) {
    errors.push("maxRetries must be non-negative");
  }

  if (config.retryDelay !== undefined && config.retryDelay <= 0) {
    errors.push("retryDelay must be positive");
  }

  if (config.websocket) {
    if (config.websocket.timeout !== undefined && config.websocket.timeout <= 0) {
      errors.push("websocket.timeout must be positive");
    }

    if (config.websocket.maxReconnectAttempts !== undefined && config.websocket.maxReconnectAttempts < 0) {
      errors.push("websocket.maxReconnectAttempts must be non-negative");
    }

    if (config.websocket.reconnectDelay !== undefined && config.websocket.reconnectDelay <= 0) {
      errors.push("websocket.reconnectDelay must be positive");
    }

    if (config.websocket.heartbeatInterval !== undefined && config.websocket.heartbeatInterval <= 0) {
      errors.push("websocket.heartbeatInterval must be positive");
    }
  }

  return errors;
}
