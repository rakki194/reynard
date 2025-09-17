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
export declare const DEFAULT_BACKEND_CONFIG: BackendAnnotationManagerConfig;
