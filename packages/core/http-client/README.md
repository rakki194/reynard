# Reynard HTTP Client

A robust, feature-rich HTTP client for the Reynard ecosystem with middleware support, retry logic, and circuit breaker patterns.

## Features

- **Middleware System**: Pluggable middleware for authentication, logging, and custom logic
- **Retry Logic**: Configurable retry strategies with exponential backoff
- **Circuit Breaker**: Automatic failure detection and recovery
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Error Handling**: Structured error responses with detailed information
- **Request/Response Interceptors**: Hook into request and response lifecycle
- **Timeout Management**: Configurable timeouts for different scenarios

## Installation

```bash
pnpm add reynard-http-client
```

## Basic Usage

```typescript
import { HTTPClient, createAuthMiddleware } from "reynard-http-client";

// Create a client instance
const client = new HTTPClient({
  baseUrl: "https://api.example.com",
  timeout: 10000,
});

// Add authentication middleware
const authMiddleware = createAuthMiddleware({
  type: "bearer",
  getToken: () => localStorage.getItem("token"),
});

client.use(authMiddleware);

// Make requests
const response = await client.get("/users");
console.log(response.data);
```

## Configuration

### HTTPClientOptions

```typescript
interface HTTPClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  circuitBreaker?: CircuitBreakerConfig;
  headers?: Record<string, string>;
}
```

### Circuit Breaker Configuration

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  recoveryTimeout: number; // Time to wait before attempting recovery
  monitoringPeriod: number; // Time window for failure counting
}
```

## Middleware

### Built-in Middleware

#### Authentication Middleware

```typescript
import { createAuthMiddleware } from "reynard-http-client";

const authMiddleware = createAuthMiddleware({
  type: "bearer", // or "basic"
  getToken: () => localStorage.getItem("token"),
  getCredentials: () => ({ username: "user", password: "pass" }),
});
```

#### Logging Middleware

```typescript
import { createLoggingMiddleware } from "reynard-http-client";

const loggingMiddleware = createLoggingMiddleware({
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
```

### Custom Middleware

```typescript
import { HTTPMiddleware } from "reynard-http-client";

const customMiddleware: HTTPMiddleware = {
  name: "custom",
  async processRequest(request, next) {
    // Modify request
    request.headers["X-Custom-Header"] = "value";

    // Continue to next middleware
    const response = await next(request);

    // Modify response
    return response;
  },
};

client.use(customMiddleware);
```

## Error Handling

The HTTP client provides structured error handling:

```typescript
try {
  const response = await client.get("/users");
  console.log(response.data);
} catch (error) {
  if (error instanceof HTTPError) {
    console.log("Status:", error.status);
    console.log("Message:", error.message);
    console.log("Data:", error.data);
  }
}
```

## Response Format

All responses follow a consistent format:

```typescript
interface HTTPResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HTTPRequestOptions;
}
```

## Advanced Usage

### Request Interceptors

```typescript
client.addRequestInterceptor(request => {
  // Add timestamp to all requests
  request.headers["X-Request-Time"] = Date.now().toString();
  return request;
});
```

### Response Interceptors

```typescript
client.addResponseInterceptor(response => {
  // Log response time
  const requestTime = response.config.headers["X-Request-Time"];
  if (requestTime) {
    const duration = Date.now() - parseInt(requestTime);
    console.log(`Request took ${duration}ms`);
  }
  return response;
});
```

### Retry Configuration

```typescript
const client = new HTTPClient({
  retries: 3,
  retryDelay: 1000,
  retryCondition: error => {
    // Only retry on network errors or 5xx status codes
    return error.status >= 500 || !error.status;
  },
});
```

## Integration with Reynard Auth

The HTTP client integrates seamlessly with Reynard Auth:

```typescript
import { HTTPClient, createAuthMiddleware } from "reynard-http-client";
import { useAuth } from "reynard-auth";

const { tokenManager } = useAuth();

const client = new HTTPClient({
  baseUrl: "https://api.example.com",
});

client.use(
  createAuthMiddleware({
    type: "bearer",
    getToken: () => tokenManager.getAccessToken(),
  })
);
```

## Testing

The HTTP client includes comprehensive test utilities:

```typescript
import { createMockHTTPClient } from "reynard-http-client/testing";

const mockClient = createMockHTTPClient();
mockClient.mockGet("/users", { data: [{ id: 1, name: "John" }] });

// Use in tests
const response = await mockClient.get("/users");
expect(response.data).toEqual([{ id: 1, name: "John" }]);
```

## API Reference

### Classes

- `HTTPClient` - Main HTTP client class
- `HTTPError` - Error class for HTTP-related errors
- `CircuitBreaker` - Circuit breaker implementation

### Interfaces

- `HTTPRequestOptions` - Request configuration
- `HTTPResponse` - Response format
- `HTTPMiddleware` - Middleware interface
- `CircuitBreakerConfig` - Circuit breaker configuration

### Functions

- `createAuthMiddleware()` - Create authentication middleware
- `createLoggingMiddleware()` - Create logging middleware
- `createRetryMiddleware()` - Create retry middleware

## License

MIT License - see LICENSE file for details.
