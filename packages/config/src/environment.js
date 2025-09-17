/**
 * Environment Configuration for Reynard Framework
 *
 * Centralized environment variable handling and configuration
 * that eliminates duplication across packages.
 */
import { ENVIRONMENT } from "./constants";
// ============================================================================
// Environment Utilities
// ============================================================================
export class EnvironmentManager {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = this.loadEnvironmentConfig();
    }
    static getInstance() {
        if (!EnvironmentManager.instance) {
            EnvironmentManager.instance = new EnvironmentManager();
        }
        return EnvironmentManager.instance;
    }
    /**
     * Load environment configuration from process.env and import.meta.env
     */
    loadEnvironmentConfig() {
        // In Vite, environment variables are available in import.meta.env
        // Fall back to process.env for Node.js environments
        const env = typeof import.meta !== "undefined" && import.meta?.env
            ? import.meta.env
            : process.env;
        return {
            NODE_ENV: env.NODE_ENV || ENVIRONMENT.DEVELOPMENT,
            VITE_API_BASE_URL: env.VITE_API_BASE_URL,
            VITE_WS_URL: env.VITE_WS_URL,
            VITE_APP_NAME: env.VITE_APP_NAME,
            VITE_APP_VERSION: env.VITE_APP_VERSION,
            VITE_DEBUG: env.VITE_DEBUG,
            VITE_LOG_LEVEL: env.VITE_LOG_LEVEL,
            VITE_ENABLE_ANALYTICS: env.VITE_ENABLE_ANALYTICS,
            VITE_ENABLE_ERROR_REPORTING: env.VITE_ENABLE_ERROR_REPORTING,
            VITE_ENABLE_PERFORMANCE_MONITORING: env.VITE_ENABLE_PERFORMANCE_MONITORING,
            VITE_AUTH_DOMAIN: env.VITE_AUTH_DOMAIN,
            VITE_AUTH_CLIENT_ID: env.VITE_AUTH_CLIENT_ID,
            VITE_AUTH_REDIRECT_URI: env.VITE_AUTH_REDIRECT_URI,
            VITE_CDN_URL: env.VITE_CDN_URL,
            VITE_SENTRY_DSN: env.VITE_SENTRY_DSN,
            VITE_GOOGLE_ANALYTICS_ID: env.VITE_GOOGLE_ANALYTICS_ID,
        };
    }
    /**
     * Get environment variable value
     */
    get(key) {
        return this.config[key];
    }
    /**
     * Get environment variable with default value
     */
    getWithDefault(key, defaultValue) {
        return this.config[key] || defaultValue;
    }
    /**
     * Get boolean environment variable
     */
    getBoolean(key, defaultValue = false) {
        const value = this.config[key];
        if (!value)
            return defaultValue;
        return value.toLowerCase() === "true" || value === "1";
    }
    /**
     * Get number environment variable
     */
    getNumber(key, defaultValue = 0) {
        const value = this.config[key];
        if (!value)
            return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    /**
     * Check if current environment matches
     */
    isEnvironment(env) {
        return this.config.NODE_ENV === env;
    }
    /**
     * Check if running in development
     */
    isDevelopment() {
        return this.isEnvironment(ENVIRONMENT.DEVELOPMENT);
    }
    /**
     * Check if running in production
     */
    isProduction() {
        return this.isEnvironment(ENVIRONMENT.PRODUCTION);
    }
    /**
     * Check if running in staging
     */
    isStaging() {
        return this.isEnvironment(ENVIRONMENT.STAGING);
    }
    /**
     * Check if running in test
     */
    isTest() {
        return this.isEnvironment(ENVIRONMENT.TEST);
    }
    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }
    /**
     * Get public configuration (safe to expose to client)
     */
    getPublic() {
        const publicKeys = [
            "NODE_ENV",
            "VITE_API_BASE_URL",
            "VITE_WS_URL",
            "VITE_APP_NAME",
            "VITE_APP_VERSION",
            "VITE_DEBUG",
            "VITE_LOG_LEVEL",
            "VITE_ENABLE_ANALYTICS",
            "VITE_ENABLE_ERROR_REPORTING",
            "VITE_ENABLE_PERFORMANCE_MONITORING",
            "VITE_AUTH_DOMAIN",
            "VITE_AUTH_CLIENT_ID",
            "VITE_AUTH_REDIRECT_URI",
            "VITE_CDN_URL",
        ];
        const publicConfig = {};
        publicKeys.forEach((key) => {
            if (this.config[key] !== undefined) {
                publicConfig[key] = this.config[key];
            }
        });
        return publicConfig;
    }
    /**
     * Validate required environment variables
     */
    validateRequired(required) {
        const missing = [];
        required.forEach((key) => {
            if (!this.config[key]) {
                missing.push(key);
            }
        });
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }
    }
}
// ============================================================================
// Convenience Functions
// ============================================================================
/**
 * Get environment manager instance
 */
export const env = EnvironmentManager.getInstance();
/**
 * Get environment variable
 */
export function getEnv(key) {
    return env.get(key);
}
/**
 * Get environment variable with default
 */
export function getEnvWithDefault(key, defaultValue) {
    return env.getWithDefault(key, defaultValue);
}
/**
 * Get boolean environment variable
 */
export function getEnvBoolean(key, defaultValue = false) {
    return env.getBoolean(key, defaultValue);
}
/**
 * Get number environment variable
 */
export function getEnvNumber(key, defaultValue = 0) {
    return env.getNumber(key, defaultValue);
}
/**
 * Check if in development
 */
export function isDevelopment() {
    return env.isDevelopment();
}
/**
 * Check if in production
 */
export function isProduction() {
    return env.isProduction();
}
/**
 * Check if in staging
 */
export function isStaging() {
    return env.isStaging();
}
/**
 * Check if in test
 */
export function isTest() {
    return env.isTest();
}
// ============================================================================
// Environment-Specific Configurations
// ============================================================================
export const ENVIRONMENT_CONFIGS = {
    [ENVIRONMENT.DEVELOPMENT]: {
        apiBaseUrl: "http://localhost:8000",
        wsUrl: "ws://localhost:8000/ws",
        debug: true,
        logLevel: "debug",
        enableAnalytics: false,
        enableErrorReporting: false,
        enablePerformanceMonitoring: true,
    },
    [ENVIRONMENT.STAGING]: {
        apiBaseUrl: "https://staging-api.(TBD)",
        wsUrl: "wss://staging-api.(TBD)/ws",
        debug: false,
        logLevel: "info",
        enableAnalytics: true,
        enableErrorReporting: true,
        enablePerformanceMonitoring: true,
    },
    [ENVIRONMENT.PRODUCTION]: {
        apiBaseUrl: "https://api.(TBD)",
        wsUrl: "wss://api.(TBD)/ws",
        debug: false,
        logLevel: "warn",
        enableAnalytics: true,
        enableErrorReporting: true,
        enablePerformanceMonitoring: true,
    },
    [ENVIRONMENT.TEST]: {
        apiBaseUrl: "http://localhost:8000",
        wsUrl: "ws://localhost:8000/ws",
        debug: true,
        logLevel: "error",
        enableAnalytics: false,
        enableErrorReporting: false,
        enablePerformanceMonitoring: false,
    },
};
/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
    const currentEnv = env.get("NODE_ENV") || ENVIRONMENT.DEVELOPMENT;
    return (ENVIRONMENT_CONFIGS[currentEnv] ||
        ENVIRONMENT_CONFIGS[ENVIRONMENT.DEVELOPMENT]);
}
