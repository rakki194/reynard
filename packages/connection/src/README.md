# Connection module

This folder provides a typed, browser-friendly connection layer for the
frontend. It standardizes how different transports (HTTP, WebSocket, SSE) are
configured, connected, monitored, and recovered, and it exposes utilities for
pooling, retries, health checks, metrics, and security headers. Everything is
written in TypeScript and designed to be light-weight for the browser (SolidJS +
Vite).

## File map

- `types.ts`: Core enums and interfaces for connections, health, metrics,
  pooling, and security.
- `base.ts`: Abstract `BaseConnection` with lifecycle, events, metrics, and
  circuit breaker.
- `config.ts`: `ConnectionConfigManager` with Vite env-driven configuration.
- `health.ts`: `HealthChecker` helpers to run periodic health tasks and shape
  results.
- `http.ts`: `HTTPConnection` implementation over `fetch` (stateless).
- `websocket.ts`: `WebSocketConnection` implementation over browser `WebSocket`.
- `sse.ts`: `SSEConnection` implementation over `EventSource`.
- `pool.ts`: Generic `ConnectionPool<T>` with acquire/release and basic
  lifecycle.
- `websocket-pool.ts`: `WebSocketConnectionPool` preconfigured `ConnectionPool`
  for WebSockets.
- `retry.ts`: Retry strategies (`ExponentialBackoffRetry`, `LinearBackoffRetry`,
  `JitterRetry`).
- `metrics.ts`: `ConnectionMetricsTracker` for rolling metrics/analytics.
- `manager.ts`: `ConnectionManager` to track connections, do health checks,
  analytics, and recovery.
- `security.ts`: `ConnectionSecurity` to build authorization headers and expose
  security info.
- `index.ts`: Barrel file exporting the public API of this module.

## Concepts and types

`types.ts` defines the public surface for the module. Connection lifecycle is
modeled with `ConnectionState` and `ConnectionHealth`, capturing the state and
health consistently across implementations. Transport kinds are identified by
`ConnectionType`, which enumerates categories such as `HTTP`, `WEBSOCKET`, and
`SSE`. Configuration is expressed via `ConnectionConfig`, covering timeouts,
retries, circuit breaker behavior, rate limiting flags, headers, and more.
Observability is represented by `ConnectionMetrics`, `ConnectionStatus`, and
`ConnectionEvent`, which together provide runtime statistics and a stream of
structured events. Health checks return a normalized `HealthCheckResult`.
Pooling and security concepts are described with `PoolConfig`, `SecurityLevel`,
and `SecurityContext`. Recovery behavior is guided by `RecoveryStrategy`,
indicating how to respond to failed health checks, including reconnect, backoff,
or graceful degradation strategies.

## BaseConnection

`BaseConnection` is the abstract foundation for all connection types. It
provides:

Lifecycle/state

The class tracks `ConnectionState`, `ConnectionHealth`, timestamps,
active/secure/authenticated flags, and exposes `getStatus()` for a typed
snapshot suitable for UI.

Events

Connections emit typed events via `onEvent`, `onStateChange`, and
`onHealthChange` handlers. Consumers can subscribe for analytics and UI updates.
Emitted events include a generated `eventId`, typed `eventType`, severity,
timestamp, and optional data/message.

Metrics

`updateMetrics` tracks request counts, error rate, throughput, and response
times. These feed into analytics via `ConnectionManager`.

Errors and circuit breaker

`handleError` captures the last error and emits an `error` event. A built-in
circuit breaker (configurable via `ConnectionConfig`) accumulates failures and
prevents further send/receive until a timeout elapses, transitioning to
half‑open before closing again on success.

Abstract methods

Subclasses implement `connect()`, `disconnect()`, and `isConnected()` for
lifecycle; `healthCheck()` returning
`{ isHealthy, responseTime, details?, errorMessage? }` for health; and
`sendImpl(data)` and `receiveImpl()` for transport-specific I/O.

`send(data)` and `receive()` are concrete wrappers around those implementations
that add metrics, circuit‑breaker checks, and error handling.

## Health utilities

`health.ts` provides `HealthChecker` to periodically run a set of async checks
with a timeout guard, and a helper `result(...)` to shape a `HealthCheckResult`.
It is intentionally minimal on the frontend and defers transport specifics to
each connection’s own `healthCheck()` implementation.

## Configuration and environment variables

`ConnectionConfigManager` (`config.ts`) constructs a default config and
auto-loads additional configs from environment variables. In Vite, values are
read from `import.meta.env.*` and fall back to `process.env.*` if needed.

Default config keys (prefixed for clarity):

```bash
VITE_CONNECTION_TIMEOUT
VITE_CONNECTION_RETRY_COUNT
VITE_CONNECTION_RETRY_DELAY
VITE_CONNECTION_BACKOFF_MULTIPLIER
VITE_CONNECTION_MAX_POOL_SIZE
VITE_CONNECTION_KEEP_ALIVE
VITE_CONNECTION_COMPRESSION
VITE_CONNECTION_ENCRYPTION
VITE_CONNECTION_SECURITY_LEVEL        # one of: none | basic | enhanced | maximum
VITE_CONNECTION_HEALTH_CHECK_INTERVAL
VITE_CONNECTION_HEALTH_CHECK_TIMEOUT
VITE_CONNECTION_AUTO_RECONNECT
VITE_CONNECTION_AUTO_RETRY
VITE_CONNECTION_CIRCUIT_BREAKER
VITE_CONNECTION_CIRCUIT_BREAKER_THRESHOLD
VITE_CONNECTION_CIRCUIT_BREAKER_TIMEOUT
VITE_CONNECTION_RATE_LIMIT
VITE_CONNECTION_RATE_LIMIT_REQUESTS
VITE_CONNECTION_RATE_LIMIT_WINDOW
VITE_CONNECTION_AUDIT_LOGGING
VITE_CONNECTION_MONITORING
VITE_CONNECTION_FALLBACK_URL
```

Additionally, transport-specific named configs are loaded when a URL is
provided. Supported prefixes (the suffixes mirror the defaults above unless
noted):

```bash
VITE_HTTP_URL
VITE_WEBSOCKET_URL
VITE_SSE_URL
VITE_DATABASE_URL
VITE_EXTERNAL_URL
```

For each prefix, the manager also reads keys like `TIMEOUT`, `RETRY_COUNT`,
`RETRY_DELAY`, `COMPRESSION`, `ENCRYPTION`, `HEALTH_CHECK_INTERVAL`, etc.
Example:

```bash
VITE_WEBSOCKET_URL=wss://example.com/ws
VITE_WEBSOCKET_RETRY_COUNT=5
VITE_WEBSOCKET_RETRY_DELAY=1
VITE_WEBSOCKET_BACKOFF_MULTIPLIER=2
```

Use `configManager.get(name)` to retrieve a `ConnectionConfig`; if a named
config wasn’t defined, you get the default config with `name` applied.

## ConnectionManager

`ConnectionManager` manages a set of `BaseConnection` instances. It supports
grouping and bulk operations through `connectAll` and `disconnectAll`. It
performs periodic, interval-based health checks via `healthCheckAll()` and can
apply automatic recovery according to configured strategies. Events can be
routed and aggregated using `addEventHandler` and `addGlobalHandler`, enabling
analytics and logging. Each connection is paired with a
`ConnectionMetricsTracker`, and the manager exposes `getStatistics()` and
`getInfo()` for UI or telemetry. Recovery behavior can be overridden per
connection with `setRecoveryStrategy`, otherwise it falls back to the
connection’s own configuration.

Automatic tasks

`start()` begins periodic health checks and a (currently minimal) cleanup loop.
`stop()` clears timers (callers should disconnect connections as needed).

## Protocol implementations

HTTP (`http.ts`)

Stateless transport built on `fetch`. `connect()` marks the connection as active
(there is no persistent socket). `sendImpl()` POSTs JSON by default and
`receiveImpl()` does a GET and attempts to JSON-parse the response, falling back
to text. `healthCheck()` uses a HEAD request.

WebSocket (`websocket.ts`)

Persistent transport built on the browser `WebSocket`. `connect()` awaits the
open event, updates health, and marks active. `sendImpl()` serializes non-string
payloads as JSON. `receiveImpl()` waits for the next message and JSON-parses
when possible.

SSE (`sse.ts`)

Server-Sent Events transport built on `EventSource`. It is one-way (server →
client), so `sendImpl()` always returns `false`. `receiveImpl()` awaits the next
message and JSON-parses when possible.

## Pooling

`ConnectionPool<T>` provides a simple browser-side pool with configurable
minimum and maximum size, along with periodic cleanup and health timers.
Consumers acquire connections using `acquire(timeout)` and return them with
`release(conn)`; when the pool is saturated, connections are closed
automatically on release to respect capacity. `WebSocketConnectionPool` is a
convenience wrapper that wires a `ConnectionPool<WebSocketConnection>` to a
factory which creates and opens WebSockets on demand using a supplied
`ConnectionConfig`.

## Retry strategies

`retry.ts` defines composable retry strategies that can wrap any async function.
Use `ExponentialBackoffRetry(maxAttempts, baseDelaySec, multiplier)` for
exponential delays,
`LinearBackoffRetry(maxAttempts, baseDelaySec, incrementSec)` for linear delays,
or `JitterRetry(maxAttempts, baseDelaySec, jitterFactor)` to add randomness that
reduces load spikes. Execute an operation with
`strategy.execute(() => doThing())` to automatically apply the computed delays
between attempts.

## Metrics and analytics

`ConnectionMetricsTracker` collects rolling response times, success/failure
counts, and error type breakdowns, exposing `summary()` with average response
time, error rate, throughput, uptime, and timestamps. `ConnectionManager`
consumes emitted `metrics` and `error` events to feed these trackers.

## Security

`ConnectionSecurity` helps build authorization headers for token/API key
scenarios and surfaces basic security info for display. Transport-level TLS is
handled by the browser.

## Public API

`index.ts` re-exports all of the above so consumers can import from
`src/connection` directly.

## Usage examples

Create a WebSocket connection and manage it

```ts
import {
  ConnectionManager,
  ConnectionConfigManager,
  ConnectionType,
  WebSocketConnection,
  RecoveryStrategy,
} from '~/src/connection';

const configManager = new ConnectionConfigManager();
// Either define VITE_WEBSOCKET_URL in env, or set one explicitly:
const wsConfig = {
  ...configManager.get('websocket'),
  connectionType: ConnectionType.WEBSOCKET,
  url: 'wss://example.com/ws',
  recoveryStrategy: RecoveryStrategy.RECONNECT_BACKOFF,
};

const manager = new ConnectionManager();
const ws = new WebSocketConnection(wsConfig);

manager.addEventHandler(evt => {
  // route to telemetry/console/notification system
  if (evt.severity === 'error') console.warn('connection error', evt);
});

manager.addConnection(ws, 'realtime');
await manager.start();
await ws.connect();

await ws.send({ hello: 'world' });
const msg = await ws.receive();
console.log('received', msg);

const health = await manager.healthCheckAll();
console.log(health);
```

Pool WebSockets

```ts
import { WebSocketConnectionPool } from '~/src/connection';

const pool = new WebSocketConnectionPool(
  {
    maxSize: 8,
    minSize: 1,
    maxIdleTime: 60,
    acquireTimeout: 5,
    releaseTimeout: 5,
    healthCheckInterval: 30,
    cleanupInterval: 60,
  },
  wsConfig
);

await pool.start();
const conn = await pool.acquire();
if (conn) {
  await conn.send({ type: 'ping' });
  await pool.release(conn);
}
```

Retry an arbitrary operation

```ts
import { ExponentialBackoffRetry } from '~/src/connection';

const retry = new ExponentialBackoffRetry(4, 1, 2); // up to 4 attempts: 1s, 2s, 4s, 8s
const result = await retry.execute(async () => {
  const res = await fetch('/api/fragile');
  if (!res.ok) throw new Error('request failed');
  return res.json();
});
```

Build authorization headers

```ts
import { ConnectionSecurity } from '~/src/connection';

const security = new ConnectionSecurity();
const headers = security.createAuthorizationHeaders('token-123', undefined);
await fetch('/api/secure', { headers });
```

## Notes

This module is oriented toward the browser. Node-specific features such as
low-level TLS are intentionally omitted because TLS is handled by the browser;
`randomUUID()` falls back to Node’s `crypto` in development or SSR environments.
`HTTPConnection` is stateless and its `connect()` simply marks the connection as
ready without creating a persistent socket. `SSEConnection` is receive‑only by
design. Circuit breaker thresholds, recovery strategies, and retry behavior are
intentionally conservative by default and should be tuned via environment
variables or per‑connection configuration to suit your application’s needs.
