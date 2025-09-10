/**
 * @deprecated Use HTTPClient from reynard-connection instead
 * This file is kept for backward compatibility but will be removed in a future version.
 */

// Re-export the unified HTTP client from reynard-connection
export { HTTPClient } from "reynard-connection";
export type {
  HTTPClientConfig, HTTPError, HTTPResponse, HTTPRequestOptions as RequestOptions
} from "reynard-connection";

// Legacy interface for backward compatibility
export interface UploadOptions {
  endpoint: string;
  formData: FormData;
  headers?: Record<string, string>;
}

// Legacy HttpClientConfig interface for backward compatibility
export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
}
