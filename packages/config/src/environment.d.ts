/**
 * Environment Configuration for Reynard Framework
 *
 * Centralized environment variable handling and configuration
 * that eliminates duplication across packages.
 */
export interface EnvironmentConfig {
    NODE_ENV: string;
    VITE_API_BASE_URL?: string;
    VITE_WS_URL?: string;
    VITE_APP_NAME?: string;
    VITE_APP_VERSION?: string;
    VITE_DEBUG?: string;
    VITE_LOG_LEVEL?: string;
    VITE_ENABLE_ANALYTICS?: string;
    VITE_ENABLE_ERROR_REPORTING?: string;
    VITE_ENABLE_PERFORMANCE_MONITORING?: string;
    VITE_AUTH_DOMAIN?: string;
    VITE_AUTH_CLIENT_ID?: string;
    VITE_AUTH_REDIRECT_URI?: string;
    VITE_CDN_URL?: string;
    VITE_SENTRY_DSN?: string;
    VITE_GOOGLE_ANALYTICS_ID?: string;
}
export declare class EnvironmentManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): EnvironmentManager;
    /**
     * Load environment configuration from process.env and import.meta.env
     */
    private loadEnvironmentConfig;
    /**
     * Get environment variable value
     */
    get(key: keyof EnvironmentConfig): string | undefined;
    /**
     * Get environment variable with default value
     */
    getWithDefault(key: keyof EnvironmentConfig, defaultValue: string): string;
    /**
     * Get boolean environment variable
     */
    getBoolean(key: keyof EnvironmentConfig, defaultValue?: boolean): boolean;
    /**
     * Get number environment variable
     */
    getNumber(key: keyof EnvironmentConfig, defaultValue?: number): number;
    /**
     * Check if current environment matches
     */
    isEnvironment(env: string): boolean;
    /**
     * Check if running in development
     */
    isDevelopment(): boolean;
    /**
     * Check if running in production
     */
    isProduction(): boolean;
    /**
     * Check if running in staging
     */
    isStaging(): boolean;
    /**
     * Check if running in test
     */
    isTest(): boolean;
    /**
     * Get all configuration
     */
    getAll(): EnvironmentConfig;
    /**
     * Get public configuration (safe to expose to client)
     */
    getPublic(): Partial<EnvironmentConfig>;
    /**
     * Validate required environment variables
     */
    validateRequired(required: (keyof EnvironmentConfig)[]): void;
}
/**
 * Get environment manager instance
 */
export declare const env: EnvironmentManager;
/**
 * Get environment variable
 */
export declare function getEnv(key: keyof EnvironmentConfig): string | undefined;
/**
 * Get environment variable with default
 */
export declare function getEnvWithDefault(key: keyof EnvironmentConfig, defaultValue: string): string;
/**
 * Get boolean environment variable
 */
export declare function getEnvBoolean(key: keyof EnvironmentConfig, defaultValue?: boolean): boolean;
/**
 * Get number environment variable
 */
export declare function getEnvNumber(key: keyof EnvironmentConfig, defaultValue?: number): number;
/**
 * Check if in development
 */
export declare function isDevelopment(): boolean;
/**
 * Check if in production
 */
export declare function isProduction(): boolean;
/**
 * Check if in staging
 */
export declare function isStaging(): boolean;
/**
 * Check if in test
 */
export declare function isTest(): boolean;
export declare const ENVIRONMENT_CONFIGS: {
    readonly development: {
        readonly apiBaseUrl: "http://localhost:8000";
        readonly wsUrl: "ws://localhost:8000/ws";
        readonly debug: true;
        readonly logLevel: "debug";
        readonly enableAnalytics: false;
        readonly enableErrorReporting: false;
        readonly enablePerformanceMonitoring: true;
    };
    readonly staging: {
        readonly apiBaseUrl: "https://staging-api.(TBD)";
        readonly wsUrl: "wss://staging-api.(TBD)/ws";
        readonly debug: false;
        readonly logLevel: "info";
        readonly enableAnalytics: true;
        readonly enableErrorReporting: true;
        readonly enablePerformanceMonitoring: true;
    };
    readonly production: {
        readonly apiBaseUrl: "https://api.(TBD)";
        readonly wsUrl: "wss://api.(TBD)/ws";
        readonly debug: false;
        readonly logLevel: "warn";
        readonly enableAnalytics: true;
        readonly enableErrorReporting: true;
        readonly enablePerformanceMonitoring: true;
    };
    readonly test: {
        readonly apiBaseUrl: "http://localhost:8000";
        readonly wsUrl: "ws://localhost:8000/ws";
        readonly debug: true;
        readonly logLevel: "error";
        readonly enableAnalytics: false;
        readonly enableErrorReporting: false;
        readonly enablePerformanceMonitoring: false;
    };
};
/**
 * Get environment-specific configuration
 */
export declare function getEnvironmentConfig(): {
    readonly apiBaseUrl: "http://localhost:8000";
    readonly wsUrl: "ws://localhost:8000/ws";
    readonly debug: true;
    readonly logLevel: "debug";
    readonly enableAnalytics: false;
    readonly enableErrorReporting: false;
    readonly enablePerformanceMonitoring: true;
} | {
    readonly apiBaseUrl: "https://staging-api.(TBD)";
    readonly wsUrl: "wss://staging-api.(TBD)/ws";
    readonly debug: false;
    readonly logLevel: "info";
    readonly enableAnalytics: true;
    readonly enableErrorReporting: true;
    readonly enablePerformanceMonitoring: true;
} | {
    readonly apiBaseUrl: "https://api.(TBD)";
    readonly wsUrl: "wss://api.(TBD)/ws";
    readonly debug: false;
    readonly logLevel: "warn";
    readonly enableAnalytics: true;
    readonly enableErrorReporting: true;
    readonly enablePerformanceMonitoring: true;
} | {
    readonly apiBaseUrl: "http://localhost:8000";
    readonly wsUrl: "ws://localhost:8000/ws";
    readonly debug: true;
    readonly logLevel: "error";
    readonly enableAnalytics: false;
    readonly enableErrorReporting: false;
    readonly enablePerformanceMonitoring: false;
};
