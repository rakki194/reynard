/**
 * Type Definitions for Mock Backend Testing
 *
 * Shared type definitions used across mock testing utilities.
 */

/**
 * Mock Backend Server Configuration
 */
export interface MockBackendConfig {
  port: number;
  baseUrl: string;
  delay?: number;
  debug?: boolean;
}

/**
 * Mock API Response
 */
export interface MockResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  delay?: number;
}
