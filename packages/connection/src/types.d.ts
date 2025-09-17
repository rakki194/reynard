export declare enum ConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTING = "disconnecting",
    ERROR = "error",
    DEGRADED = "degraded"
}
export declare enum ConnectionType {
    INTERNET = "internet",
    BACKEND = "backend",
    AUTHENTICATION = "authentication",
    SERVICE = "service",
    REALTIME = "realtime",
    FILESYSTEM = "filesystem",
    HTTP = "http",
    WEBSOCKET = "websocket",
    SSE = "sse",
    DATABASE = "database",
    EXTERNAL = "external"
}
export declare enum ConnectionHealth {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy",
    UNKNOWN = "unknown"
}
export declare enum SecurityLevel {
    NONE = "none",
    BASIC = "basic",
    ENHANCED = "enhanced",
    MAXIMUM = "maximum"
}
export declare enum RecoveryStrategy {
    NONE = "none",
    RECONNECT = "reconnect",
    RECONNECT_BACKOFF = "reconnect_backoff",
    FALLBACK = "fallback",
    GRACEFUL_DEGRADATION = "graceful_degradation"
}
export interface ConnectionMetrics {
    responseTime: number;
    throughput: number;
    latency: number;
    bandwidth: number;
    errorRate: number;
    availability: number;
    successCount: number;
    errorCount: number;
    totalRequests: number;
    lastRequestTime?: number;
    lastResponseTime?: number;
}
export interface ConnectionConfig {
    name: string;
    connectionType: ConnectionType;
    url?: string;
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
    maxConnections?: number;
    keepAlive?: number;
    compression?: boolean;
    encryption?: boolean;
    securityLevel?: SecurityLevel;
    healthCheckInterval?: number;
    healthCheckTimeout?: number;
    autoReconnect?: boolean;
    autoRetry?: boolean;
    circuitBreakerEnabled?: boolean;
    circuitBreakerThreshold?: number;
    circuitBreakerTimeout?: number;
    rateLimitEnabled?: boolean;
    rateLimitRequests?: number;
    rateLimitWindow?: number;
    auditLogging?: boolean;
    monitoringEnabled?: boolean;
    recoveryStrategy?: RecoveryStrategy;
    fallbackUrl?: string;
    customHeaders?: Record<string, string>;
    customOptions?: Record<string, unknown>;
}
export interface ConnectionStatus {
    connectionId: string;
    name: string;
    connectionType: ConnectionType;
    state: ConnectionState;
    health: ConnectionHealth;
    config: ConnectionConfig;
    metrics: ConnectionMetrics;
    lastHealthCheck?: number;
    lastError?: string | null;
    errorCount: number;
    consecutiveErrors: number;
    createdAt: number;
    updatedAt: number;
    isActive: boolean;
    isSecure: boolean;
    isAuthenticated: boolean;
}
export interface ConnectionEvent {
    eventId: string;
    connectionId: string;
    eventType: string;
    timestamp: number;
    data?: Record<string, unknown>;
    severity?: "info" | "warning" | "error";
    message?: string;
}
export interface HealthCheckResult {
    connectionId: string;
    timestamp: number;
    isHealthy: boolean;
    responseTime: number;
    errorMessage?: string;
    details?: Record<string, unknown>;
}
export interface RetryContext {
    attempt: number;
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
    lastError?: Error;
    startTime: number;
}
export interface SecurityContext {
    authenticationToken?: string;
    authorizationHeaders?: Record<string, string>;
    encryptionEnabled?: boolean;
    certificateValidation?: boolean;
    customSecurityOptions?: Record<string, unknown>;
}
export interface PoolConfig {
    maxSize: number;
    minSize: number;
    maxIdleTime: number;
    acquireTimeout: number;
    releaseTimeout: number;
    healthCheckInterval: number;
    cleanupInterval: number;
}
export interface ConnectionInfo {
    totalConnections: number;
    activeConnections: number;
    healthyConnections: number;
    degradedConnections: number;
    unhealthyConnections: number;
    errorConnections: number;
    averageResponseTime: number;
    totalRequests: number;
    totalErrors: number;
    overallHealth: ConnectionHealth;
    lastUpdated: number;
}
