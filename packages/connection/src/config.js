import { ConnectionType, SecurityLevel, RecoveryStrategy, } from "./types";
function env(name, fallback) {
    // Frontend: rely on import.meta.env when available (Vite)
    const v = import.meta?.env?.[name] ??
        globalThis?.process?.env?.[name];
    return (v ?? fallback);
}
export class ConnectionConfigManager {
    constructor() {
        Object.defineProperty(this, "configs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "defaultConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.defaultConfig = this.createDefault();
        this.loadFromEnv();
    }
    createDefault() {
        return {
            name: "default",
            connectionType: ConnectionType.HTTP,
            url: undefined,
            timeout: Number(env("VITE_CONNECTION_TIMEOUT", "30")),
            retryCount: Number(env("VITE_CONNECTION_RETRY_COUNT", "3")),
            retryDelay: Number(env("VITE_CONNECTION_RETRY_DELAY", "1")),
            backoffMultiplier: Number(env("VITE_CONNECTION_BACKOFF_MULTIPLIER", "2")),
            maxConnections: Number(env("VITE_CONNECTION_MAX_POOL_SIZE", "10")),
            keepAlive: Number(env("VITE_CONNECTION_KEEP_ALIVE", "60")),
            compression: String(env("VITE_CONNECTION_COMPRESSION", "true")).toLowerCase() ===
                "true",
            encryption: String(env("VITE_CONNECTION_ENCRYPTION", "true")).toLowerCase() ===
                "true",
            securityLevel: env("VITE_CONNECTION_SECURITY_LEVEL", "basic") in SecurityLevel
                ? SecurityLevel[String(env("VITE_CONNECTION_SECURITY_LEVEL", "basic")).toUpperCase()]
                : SecurityLevel.BASIC,
            healthCheckInterval: Number(env("VITE_CONNECTION_HEALTH_CHECK_INTERVAL", "30")),
            healthCheckTimeout: Number(env("VITE_CONNECTION_HEALTH_CHECK_TIMEOUT", "5")),
            autoReconnect: String(env("VITE_CONNECTION_AUTO_RECONNECT", "true")).toLowerCase() ===
                "true",
            autoRetry: String(env("VITE_CONNECTION_AUTO_RETRY", "true")).toLowerCase() ===
                "true",
            circuitBreakerEnabled: String(env("VITE_CONNECTION_CIRCUIT_BREAKER", "true")).toLowerCase() ===
                "true",
            circuitBreakerThreshold: Number(env("VITE_CONNECTION_CIRCUIT_BREAKER_THRESHOLD", "5")),
            circuitBreakerTimeout: Number(env("VITE_CONNECTION_CIRCUIT_BREAKER_TIMEOUT", "60")),
            rateLimitEnabled: String(env("VITE_CONNECTION_RATE_LIMIT", "false")).toLowerCase() ===
                "true",
            rateLimitRequests: Number(env("VITE_CONNECTION_RATE_LIMIT_REQUESTS", "100")),
            rateLimitWindow: Number(env("VITE_CONNECTION_RATE_LIMIT_WINDOW", "60")),
            auditLogging: String(env("VITE_CONNECTION_AUDIT_LOGGING", "true")).toLowerCase() ===
                "true",
            monitoringEnabled: String(env("VITE_CONNECTION_MONITORING", "true")).toLowerCase() ===
                "true",
            recoveryStrategy: RecoveryStrategy.RECONNECT_BACKOFF,
            fallbackUrl: env("VITE_CONNECTION_FALLBACK_URL"),
            customHeaders: {},
            customOptions: {},
        };
    }
    loadFromEnv() {
        const prefixes = [
            "VITE_HTTP_",
            "VITE_WEBSOCKET_",
            "VITE_SSE_",
            "VITE_DATABASE_",
            "VITE_EXTERNAL_",
        ];
        for (const prefix of prefixes) {
            const urlKey = `${prefix}URL`;
            if (env(urlKey)) {
                const name = prefix.replace(/_+$/, "").toLowerCase();
                this.configs.set(name, this.createFromEnv(prefix, name));
            }
        }
    }
    createFromEnv(prefix, name) {
        const typeMap = {
            VITE_HTTP_: ConnectionType.HTTP,
            VITE_WEBSOCKET_: ConnectionType.WEBSOCKET,
            VITE_SSE_: ConnectionType.SSE,
            VITE_DATABASE_: ConnectionType.DATABASE,
            VITE_EXTERNAL_: ConnectionType.EXTERNAL,
        };
        const type = typeMap[prefix] ?? ConnectionType.EXTERNAL;
        const d = this.defaultConfig;
        return {
            name,
            connectionType: type,
            url: env(`${prefix}URL`),
            timeout: Number(env(`${prefix}TIMEOUT`, String(d.timeout))),
            retryCount: Number(env(`${prefix}RETRY_COUNT`, String(d.retryCount))),
            retryDelay: Number(env(`${prefix}RETRY_DELAY`, String(d.retryDelay))),
            backoffMultiplier: Number(env(`${prefix}BACKOFF_MULTIPLIER`, String(d.backoffMultiplier))),
            maxConnections: Number(env(`${prefix}MAX_CONNECTIONS`, String(d.maxConnections))),
            keepAlive: Number(env(`${prefix}KEEP_ALIVE`, String(d.keepAlive))),
            compression: String(env(`${prefix}COMPRESSION`, String(d.compression))).toLowerCase() === "true",
            encryption: String(env(`${prefix}ENCRYPTION`, String(d.encryption))).toLowerCase() === "true",
            securityLevel: d.securityLevel,
            healthCheckInterval: Number(env(`${prefix}HEALTH_CHECK_INTERVAL`, String(d.healthCheckInterval))),
            healthCheckTimeout: Number(env(`${prefix}HEALTH_CHECK_TIMEOUT`, String(d.healthCheckTimeout))),
            autoReconnect: String(env(`${prefix}AUTO_RECONNECT`, String(d.autoReconnect))).toLowerCase() === "true",
            autoRetry: String(env(`${prefix}AUTO_RETRY`, String(d.autoRetry))).toLowerCase() === "true",
            circuitBreakerEnabled: String(env(`${prefix}CIRCUIT_BREAKER`, String(d.circuitBreakerEnabled))).toLowerCase() === "true",
            circuitBreakerThreshold: Number(env(`${prefix}CIRCUIT_BREAKER_THRESHOLD`, String(d.circuitBreakerThreshold))),
            circuitBreakerTimeout: Number(env(`${prefix}CIRCUIT_BREAKER_TIMEOUT`, String(d.circuitBreakerTimeout))),
            rateLimitEnabled: String(env(`${prefix}RATE_LIMIT`, String(d.rateLimitEnabled))).toLowerCase() === "true",
            rateLimitRequests: Number(env(`${prefix}RATE_LIMIT_REQUESTS`, String(d.rateLimitRequests))),
            rateLimitWindow: Number(env(`${prefix}RATE_LIMIT_WINDOW`, String(d.rateLimitWindow))),
            auditLogging: String(env(`${prefix}AUDIT_LOGGING`, String(d.auditLogging))).toLowerCase() === "true",
            monitoringEnabled: String(env(`${prefix}MONITORING`, String(d.monitoringEnabled))).toLowerCase() === "true",
            recoveryStrategy: d.recoveryStrategy,
            fallbackUrl: env(`${prefix}FALLBACK_URL`, d.fallbackUrl),
            customHeaders: { ...d.customHeaders },
            customOptions: { ...d.customOptions },
        };
    }
    get(name) {
        return this.configs.get(name) ?? { ...this.defaultConfig, name };
    }
    set(name, config) {
        this.configs.set(name, config);
    }
    listNames() {
        return Array.from(this.configs.keys());
    }
}
