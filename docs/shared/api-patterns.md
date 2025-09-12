# Shared API Patterns

_Common API design patterns and structures used across Reynard services_

## Standard Request/Response Models

### Base Response Structure

```typescript
interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    processingTime?: number;
  };
}
```

### Pagination Response

```typescript
interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Error Response

```typescript
interface ErrorResponse extends BaseResponse<never> {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string; // Development only
  };
}
```

## Common Endpoint Patterns

### Health Check Endpoints

```typescript
// GET /api/{service}/health
interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    [serviceName: string]: {
      status: "up" | "down";
      responseTime?: number;
      lastCheck: string;
    };
  };
  version: string;
  uptime: number;
}
```

### Statistics Endpoints

```typescript
// GET /api/{service}/admin/stats
interface StatsResponse {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  errorRate: number;
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}
```

### Configuration Endpoints

```typescript
// GET /api/{service}/config
interface ConfigResponse {
  enabled: boolean;
  settings: Record<string, unknown>;
  version: string;
  lastUpdated: string;
}

// POST /api/{service}/config
interface ConfigUpdateRequest {
  settings: Record<string, unknown>;
  validate?: boolean;
}
```

## Service-Specific Patterns

### RAG Service Patterns

```typescript
// POST /api/rag/query
interface RAGQueryRequest {
  q: string;
  modality?: "docs" | "code" | "captions" | "images";
  top_k?: number;
  similarity_threshold?: number;
  enable_reranking?: boolean;
}

interface RAGQueryResponse {
  hits: RAGQueryHit[];
  total: number;
  query_time?: number;
  embedding_time?: number;
  search_time?: number;
}

// POST /api/rag/ingest
interface RAGIngestRequest {
  items: RAGIngestItem[];
  model?: string;
  batch_size?: number;
  force_reindex?: boolean;
}
```

### TTS Service Patterns

```typescript
// POST /api/tts/synthesize
interface TTSSynthesizeRequest {
  text: string;
  backend?: "kokoro" | "coqui" | "xtts";
  voice?: string;
  speed?: number;
  lang?: string;
}

interface TTSSynthesizeResponse {
  success: boolean;
  audio_url?: string;
  processing_time: number;
  audio_duration?: number;
}
```

### Ollama Service Patterns

```typescript
// POST /api/ollama/chat
interface OllamaChatRequest {
  message: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OllamaChatResponse {
  response: string;
  model: string;
  processing_time: number;
  tokens_generated?: number;
}
```

## Streaming Patterns

### Server-Sent Events

```typescript
// Event stream format
interface StreamEvent {
  type: "token" | "complete" | "error" | "progress";
  data: unknown;
  metadata?: Record<string, unknown>;
}

// Example: Streaming chat
interface ChatStreamEvent extends StreamEvent {
  type: "token" | "complete" | "error";
  data: string | { response: string; tokens_generated: number };
}
```

### WebSocket Patterns

```typescript
// WebSocket message format
interface WSMessage {
  type: string;
  payload: unknown;
  requestId?: string;
  timestamp: string;
}

// Connection management
interface WSConnectionState {
  status: "connecting" | "connected" | "disconnected" | "error";
  lastError?: string;
  reconnectAttempts: number;
}
```

## Error Handling Patterns

### Standard Error Codes

```typescript
enum ErrorCode {
  // General errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",

  // Service-specific errors
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_MODEL = "INVALID_MODEL",
  PROCESSING_TIMEOUT = "PROCESSING_TIMEOUT",
}
```

### Error Response Format

```typescript
interface ServiceError {
  code: ErrorCode;
  message: string;
  details?: {
    field?: string;
    value?: unknown;
    constraint?: string;
  };
  retryAfter?: number; // For rate limiting
  requestId: string;
}
```

## Authentication Patterns

### JWT Token Structure

```typescript
interface JWTPayload {
  sub: string; // User ID
  iat: number; // Issued at
  exp: number; // Expires at
  roles: string[];
  permissions: string[];
}
```

### API Key Authentication

```typescript
interface APIKeyRequest {
  apiKey: string;
  service: string;
  permissions?: string[];
}
```

## Rate Limiting Patterns

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Response

```typescript
interface RateLimitResponse {
  error: {
    code: "RATE_LIMIT_EXCEEDED";
    message: string;
    retryAfter: number;
  };
}
```

## Monitoring and Observability

### Request Logging

```typescript
interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  processingTime: number;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}
```

### Metrics Collection

```typescript
interface ServiceMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    byEndpoint: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  errors: {
    byCode: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
}
```

## Testing Patterns

### API Test Utilities

```typescript
// Test helper for API calls
async function testAPIEndpoint<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ response: Response; data: T }> {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  return { response, data };
}
```

### Mock Service Responses

```typescript
// Mock service for testing
class MockService {
  async healthCheck(): Promise<HealthResponse> {
    return {
      status: "healthy",
      services: {},
      version: "1.0.0",
      uptime: 3600,
    };
  }

  async getStats(): Promise<StatsResponse> {
    return {
      totalRequests: 1000,
      successfulRequests: 950,
      failedRequests: 50,
      averageProcessingTime: 0.5,
      errorRate: 0.05,
      uptime: 3600,
      memoryUsage: {
        used: 100,
        total: 1000,
        percentage: 10,
      },
    };
  }
}
```

## Cross-References

- [RAG Backend Implementation](../rag-backend.md)
- [TTS Backend Implementation](../tts-backend.md)
- [Ollama Backend Implementation](../ollama-backend.md)
- [Summarization Backend Implementation](../summarization-backend.md)
- [Configuration Examples](./configuration-examples.md)
