// Core connection types and enums for the frontend connection manager

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',
  DEGRADED = 'degraded',
}

export enum ConnectionType {
  INTERNET = 'internet',
  BACKEND = 'backend',
  AUTHENTICATION = 'authentication',
  SERVICE = 'service',
  REALTIME = 'realtime',
  FILESYSTEM = 'filesystem',
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  SSE = 'sse',
  DATABASE = 'database',
  EXTERNAL = 'external',
}

export enum ConnectionHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

export enum SecurityLevel {
  NONE = 'none',
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  MAXIMUM = 'maximum',
}

export enum RecoveryStrategy {
  NONE = 'none',
  RECONNECT = 'reconnect',
  RECONNECT_BACKOFF = 'reconnect_backoff',
  FALLBACK = 'fallback',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
}

export interface ConnectionMetrics {
  responseTime: number; // ms
  throughput: number; // rps
  latency: number; // ms
  bandwidth: number; // bytes/s
  errorRate: number; // percentage
  availability: number; // percentage
  successCount: number;
  errorCount: number;
  totalRequests: number;
  lastRequestTime?: number; // epoch ms
  lastResponseTime?: number; // epoch ms
}

export interface ConnectionConfig {
  name: string;
  connectionType: ConnectionType;
  url?: string;
  timeout?: number; // seconds
  retryCount?: number;
  retryDelay?: number; // seconds
  backoffMultiplier?: number;
  maxConnections?: number;
  keepAlive?: number; // seconds
  compression?: boolean;
  encryption?: boolean;
  securityLevel?: SecurityLevel;
  healthCheckInterval?: number; // seconds
  healthCheckTimeout?: number; // seconds
  autoReconnect?: boolean;
  autoRetry?: boolean;
  circuitBreakerEnabled?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number; // seconds
  rateLimitEnabled?: boolean;
  rateLimitRequests?: number;
  rateLimitWindow?: number; // seconds
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
  lastHealthCheck?: number; // epoch ms
  lastError?: string | null;
  errorCount: number;
  consecutiveErrors: number;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  isActive: boolean;
  isSecure: boolean;
  isAuthenticated: boolean;
}

export interface ConnectionEvent {
  eventId: string;
  connectionId: string;
  eventType: string;
  timestamp: number; // epoch ms
  data?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error';
  message?: string;
}

export interface HealthCheckResult {
  connectionId: string;
  timestamp: number; // epoch ms
  isHealthy: boolean;
  responseTime: number; // ms
  errorMessage?: string;
  details?: Record<string, unknown>;
}

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  delay: number; // seconds
  backoffMultiplier: number;
  lastError?: Error;
  startTime: number; // epoch ms
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
  maxIdleTime: number; // seconds
  acquireTimeout: number; // seconds
  releaseTimeout: number; // seconds
  healthCheckInterval: number; // seconds
  cleanupInterval: number; // seconds
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
  lastUpdated: number; // epoch ms
}
