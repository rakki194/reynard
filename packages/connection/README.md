# reynard-connection

Enterprise-grade networking for Reynard applications with comprehensive connection management, health monitoring, and recovery strategies.

## Features

- **Multiple Protocols**: HTTP, WebSocket, and Server-Sent Events support
- **Connection Pooling**: Efficient connection reuse and management
- **Health Monitoring**: Automatic health checks and recovery
- **Retry Strategies**: Configurable retry logic with exponential backoff
- **Security**: Built-in security features and authentication
- **Metrics**: Comprehensive connection metrics and analytics
- **TypeScript First**: Full type safety with excellent IntelliSense

## Installation

```bash
npm install reynard-connection
```

## Quick Start

### Basic HTTP Connection

```typescript
import { HTTPConnection, ConnectionConfigManager } from "reynard-connection";

const configManager = new ConnectionConfigManager();
const config = configManager.get("http");

const httpConn = new HTTPConnection({
  ...config,
  url: "https://api.example.com",
  timeout: 5000,
});

await httpConn.connect();
const response = await httpConn.send({ method: "GET", url: "/users" });
```

### WebSocket Connection

```typescript
import { WebSocketConnection, ConnectionManager } from "reynard-connection";

const wsConn = new WebSocketConnection({
  url: "wss://api.example.com/ws",
  timeout: 10000,
  retryCount: 3,
});

const manager = new ConnectionManager();
manager.addConnection(wsConn, "realtime");

await manager.start();
await wsConn.connect();

// Send and receive messages
await wsConn.send({ type: "ping" });
const message = await wsConn.receive();
```

### Connection Pooling

```typescript
import { WebSocketConnectionPool } from "reynard-connection";

const pool = new WebSocketConnectionPool(
  {
    maxSize: 8,
    minSize: 1,
    maxIdleTime: 60,
    acquireTimeout: 5,
  },
  wsConfig,
);

await pool.start();
const conn = await pool.acquire();
if (conn) {
  await conn.send({ type: "data", payload: "test" });
  await pool.release(conn);
}
```

## Configuration

### Environment Variables

```bash
# Connection defaults
VITE_CONNECTION_TIMEOUT=5000
VITE_CONNECTION_RETRY_COUNT=3
VITE_CONNECTION_RETRY_DELAY=1000
VITE_CONNECTION_BACKOFF_MULTIPLIER=2
VITE_CONNECTION_MAX_POOL_SIZE=10
VITE_CONNECTION_KEEP_ALIVE=30000
VITE_CONNECTION_COMPRESSION=true
VITE_CONNECTION_ENCRYPTION=true
VITE_CONNECTION_SECURITY_LEVEL=enhanced
VITE_CONNECTION_HEALTH_CHECK_INTERVAL=30000
VITE_CONNECTION_AUTO_RECONNECT=true
VITE_CONNECTION_CIRCUIT_BREAKER=true
VITE_CONNECTION_CIRCUIT_BREAKER_THRESHOLD=5
VITE_CONNECTION_CIRCUIT_BREAKER_TIMEOUT=60000

# Protocol-specific URLs
VITE_HTTP_URL=https://api.example.com
VITE_WEBSOCKET_URL=wss://api.example.com/ws
VITE_SSE_URL=https://api.example.com/events
```

### Custom Configuration

```typescript
import { ConnectionConfig } from "reynard-connection";

const customConfig: ConnectionConfig = {
  name: "api",
  url: "https://api.example.com",
  connectionType: ConnectionType.HTTP,
  timeout: 10000,
  retryCount: 5,
  retryDelay: 2000,
  backoffMultiplier: 1.5,
  maxConnections: 20,
  keepAlive: 60000,
  compression: true,
  encryption: true,
  securityLevel: SecurityLevel.MAXIMUM,
  healthCheckInterval: 15000,
  healthCheckTimeout: 5000,
  autoReconnect: true,
  autoRetry: true,
  circuitBreaker: true,
  circuitBreakerThreshold: 10,
  circuitBreakerTimeout: 120000,
  rateLimit: true,
  rateLimitRequests: 100,
  rateLimitWindow: 60000,
  auditLogging: true,
  monitoring: true,
  customHeaders: {
    "X-API-Key": "your-api-key",
    "User-Agent": "MyApp/1.0",
  },
};
```

## Connection Types

### HTTPConnection

Stateless HTTP connections with automatic retry and error handling.

```typescript
const httpConn = new HTTPConnection(config);

// Connect (marks as ready)
await httpConn.connect();

// Send request
const response = await httpConn.send({
  method: "POST",
  url: "/api/data",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "test" }),
});

// Health check
const health = await httpConn.healthCheck();
console.log(health.isHealthy);
```

### WebSocketConnection

Persistent WebSocket connections with automatic reconnection.

```typescript
const wsConn = new WebSocketConnection(config);

// Connect
await wsConn.connect();

// Send message
await wsConn.send({ type: "message", data: "hello" });

// Receive message
const message = await wsConn.receive();

// Check connection status
const isConnected = await wsConn.isConnected();
```

### SSEConnection

Server-Sent Events for one-way server-to-client communication.

```typescript
const sseConn = new SSEConnection(config);

// Connect
await sseConn.connect();

// Receive events (send always returns false for SSE)
const event = await sseConn.receive();
console.log(event.data);
```

## Connection Management

### ConnectionManager

Centralized management of multiple connections.

```typescript
import { ConnectionManager } from "reynard-connection";

const manager = new ConnectionManager();

// Add connections
manager.addConnection(httpConn, "api");
manager.addConnection(wsConn, "realtime");

// Start management (begins health checks)
await manager.start();

// Bulk operations
await manager.connectAll();
await manager.healthCheckAll();
await manager.disconnectAll();

// Get statistics
const stats = manager.getStatistics();
console.log(stats.totalConnections, stats.healthyConnections);

// Stop management
await manager.stop();
```

### Connection Pooling

Efficient connection reuse with automatic lifecycle management.

```typescript
import { ConnectionPool, WebSocketConnectionPool } from "reynard-connection";

// Generic pool
const pool = new ConnectionPool<WebSocketConnection>(
  {
    maxSize: 10,
    minSize: 2,
    maxIdleTime: 300,
    acquireTimeout: 10,
    releaseTimeout: 5,
    healthCheckInterval: 60,
    cleanupInterval: 120,
  },
  (config) => new WebSocketConnection(config),
);

// Pre-configured WebSocket pool
const wsPool = new WebSocketConnectionPool(poolConfig, wsConfig);

await pool.start();

// Acquire connection
const conn = await pool.acquire();
if (conn) {
  try {
    await conn.send(data);
  } finally {
    await pool.release(conn);
  }
}
```

## Retry Strategies

### Exponential Backoff

```typescript
import { ExponentialBackoffRetry } from "reynard-connection";

const retry = new ExponentialBackoffRetry(5, 1, 2); // 5 attempts: 1s, 2s, 4s, 8s, 16s

const result = await retry.execute(async () => {
  const response = await fetch("/api/data");
  if (!response.ok) throw new Error("Request failed");
  return response.json();
});
```

### Linear Backoff

```typescript
import { LinearBackoffRetry } from "reynard-connection";

const retry = new LinearBackoffRetry(3, 1, 2); // 3 attempts: 1s, 3s, 5s

const result = await retry.execute(async () => {
  return await riskyOperation();
});
```

### Jitter Retry

```typescript
import { JitterRetry } from "reynard-connection";

const retry = new JitterRetry(4, 1, 0.5); // 4 attempts with ±50% jitter

const result = await retry.execute(async () => {
  return await distributedOperation();
});
```

## Health Monitoring

### Health Checks

```typescript
// Automatic health checks
const health = await connection.healthCheck();
console.log({
  isHealthy: health.isHealthy,
  responseTime: health.responseTime,
  details: health.details,
  errorMessage: health.errorMessage,
});

// Manual health check with custom timeout
const health = await connection.healthCheck(10000);
```

### Health Events

```typescript
connection.onHealthChange((health) => {
  if (health === ConnectionHealth.UNHEALTHY) {
    console.log("Connection is unhealthy, attempting recovery...");
  }
});

connection.onEvent((event) => {
  if (event.eventType === "health_check_failed") {
    console.log("Health check failed:", event.message);
  }
});
```

## Security

### Security Levels

```typescript
import { SecurityLevel, ConnectionSecurity } from "reynard-connection";

// Configure security level
const config = {
  ...baseConfig,
  securityLevel: SecurityLevel.MAXIMUM,
  encryption: true,
  customHeaders: {
    Authorization: "Bearer token",
    "X-API-Key": "api-key",
  },
};

// Create security context
const security = new ConnectionSecurity();
const headers = security.createAuthorizationHeaders("token", "api-key");
```

### Authentication

```typescript
// Token-based authentication
const authHeaders = security.createAuthorizationHeaders("bearer-token");

// API key authentication
const apiHeaders = security.createAuthorizationHeaders(null, "api-key");

// Custom authentication
const customHeaders = {
  "X-Custom-Auth": "custom-token",
  "X-Client-ID": "client-id",
};
```

## Metrics and Analytics

### Connection Metrics

```typescript
// Get connection metrics
const metrics = connection.getMetrics();
console.log({
  requestCount: metrics.requestCount,
  errorCount: metrics.errorCount,
  errorRate: metrics.errorRate,
  averageResponseTime: metrics.averageResponseTime,
  throughput: metrics.throughput,
  uptime: metrics.uptime,
});

// Get aggregated metrics from manager
const stats = manager.getStatistics();
console.log(stats);
```

### Event Tracking

```typescript
// Track custom events
connection.emitEvent("custom_event", {
  data: { userId: 123, action: "login" },
  severity: "info",
});

// Listen to all events
manager.addGlobalHandler((type, event) => {
  console.log(`Event: ${type}`, event);
});
```

## Error Handling

### Connection Errors

```typescript
connection.onEvent((event) => {
  if (event.severity === "error") {
    console.error("Connection error:", event.message);

    // Handle specific error types
    if (event.eventType === "connection_failed") {
      // Attempt reconnection
      connection.connect();
    } else if (event.eventType === "authentication_failed") {
      // Refresh authentication
      refreshAuthToken();
    }
  }
});
```

### Circuit Breaker

```typescript
// Circuit breaker automatically opens after threshold failures
connection.onEvent((event) => {
  if (event.eventType === "circuit_breaker_opened") {
    console.log("Circuit breaker opened, requests will be rejected");
  } else if (event.eventType === "circuit_breaker_closed") {
    console.log("Circuit breaker closed, requests will be allowed");
  }
});
```

## Best Practices

### 1. Connection Lifecycle

```typescript
// Always clean up connections
try {
  await connection.connect();
  // Use connection
} finally {
  await connection.disconnect();
}
```

### 2. Error Handling

```typescript
// Handle connection errors gracefully
connection.onEvent((event) => {
  if (event.severity === "error") {
    // Log error
    console.error("Connection error:", event);

    // Implement fallback logic
    if (event.eventType === "connection_lost") {
      // Switch to backup connection
      switchToBackupConnection();
    }
  }
});
```

### 3. Health Monitoring

```typescript
// Regular health checks
setInterval(async () => {
  const health = await connection.healthCheck();
  if (!health.isHealthy) {
    console.warn("Connection unhealthy, response time:", health.responseTime);
  }
}, 30000);
```

### 4. Connection Pooling

```typescript
// Use connection pools for high-throughput scenarios
const pool = new WebSocketConnectionPool(poolConfig, wsConfig);

// Always release connections back to pool
const conn = await pool.acquire();
try {
  await conn.send(data);
} finally {
  await pool.release(conn);
}
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**: Increase timeout values or check network connectivity
2. **Authentication Failures**: Verify credentials and token expiration
3. **Circuit Breaker**: Check error rates and adjust thresholds
4. **Pool Exhaustion**: Increase pool size or check for connection leaks

### Debug Mode

```typescript
// Enable debug logging
const config = {
  ...baseConfig,
  debug: true,
  logLevel: "debug",
};

// Monitor connection events
connection.onEvent((event) => {
  console.log("Connection event:", event);
});
```

## API Reference

See the [API documentation](./docs/api.md) for complete reference of all classes, methods, and types.
