/**
 * Configuration Manager Implementation
 *
 * Handles HTTP client configuration management including authentication
 * and header management.
 */

import { HTTPClientConfig } from "./types";
import { HTTP_PRESETS } from "./presets";

export class ConfigManager {
  private config: Required<HTTPClientConfig>;
  private baseHeaders: Record<string, string>;

  constructor(config: HTTPClientConfig) {
    // Merge with default preset
    const preset = HTTP_PRESETS[config.preset || "default"];
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? preset.config.timeout ?? 30000,
      retries: config.retries ?? preset.config.retries ?? 3,
      apiKey: config.apiKey ?? "",
      headers: config.headers ?? {},
      authToken: config.authToken ?? "",
      enableRetry: config.enableRetry ?? preset.config.enableRetry ?? true,
      enableCircuitBreaker: config.enableCircuitBreaker ?? preset.config.enableCircuitBreaker ?? true,
      enableMetrics: config.enableMetrics ?? preset.config.enableMetrics ?? true,
      middleware: config.middleware ?? [],
      preset: config.preset ?? "default",
    };

    this.baseHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...this.config.headers,
    };

    // Set up authentication
    this.updateAuthHeaders();
  }

  /**
   * Get the current configuration
   */
  getConfig(): Required<HTTPClientConfig> {
    return { ...this.config };
  }

  /**
   * Get the base headers
   */
  getBaseHeaders(): Record<string, string> {
    return { ...this.baseHeaders };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HTTPClientConfig>): void {
    Object.assign(this.config, newConfig);

    // Update headers if auth changed
    if (newConfig.apiKey !== undefined || newConfig.authToken !== undefined) {
      this.updateAuthHeaders();
    }
  }

  /**
   * Build URL from endpoint and base URL
   */
  buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.config.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private updateAuthHeaders(): void {
    if (this.config.apiKey && this.config.apiKey.length > 0) {
      this.baseHeaders.Authorization = `Bearer ${this.config.apiKey}`;
    } else if (this.config.authToken && this.config.authToken.length > 0) {
      this.baseHeaders.Authorization = `Bearer ${this.config.authToken}`;
    } else {
      delete this.baseHeaders.Authorization;
    }
  }
}
