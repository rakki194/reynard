/**
 * HTTP System Types
 *
 * Type definitions for the Reynard HTTP system including client configuration,
 * request/response types, middleware interfaces, and error handling.
 */
export const HTTP_PRESETS = {
    default: {
        name: "default",
        config: {
            timeout: 30000,
            retries: 3,
            enableRetry: true,
            enableCircuitBreaker: true,
            enableMetrics: true,
        },
        middleware: [],
    },
    api: {
        name: "api",
        config: {
            timeout: 10000,
            retries: 2,
            enableRetry: true,
            enableCircuitBreaker: true,
            enableMetrics: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        middleware: [],
    },
    upload: {
        name: "upload",
        config: {
            timeout: 300000, // 5 minutes
            retries: 1,
            enableRetry: true,
            enableCircuitBreaker: false,
            enableMetrics: true,
        },
        middleware: [],
    },
    download: {
        name: "download",
        config: {
            timeout: 600000, // 10 minutes
            retries: 2,
            enableRetry: true,
            enableCircuitBreaker: true,
            enableMetrics: true,
        },
        middleware: [],
    },
};
