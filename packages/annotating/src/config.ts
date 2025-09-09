/**
 * Configuration types and constants for Backend Annotation Manager
 */

export interface BackendAnnotationManagerConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
}

/**
 * Default configuration for backend annotation manager
 */
export const DEFAULT_BACKEND_CONFIG: BackendAnnotationManagerConfig = {
  baseUrl: "http://localhost:8000",
  timeout: 30000,
  retries: 3,
};
