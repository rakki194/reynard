# Reynard Connection Package

> **The Foundation of Reynard's Communication & Validation Systems** 🦊

The Reynard Connection package provides comprehensive utilities for HTTP communication, validation, and error handling
across all Reynard packages.

## Architecture

```mermaid
graph TB
    subgraph "🔗 Reynard Connection Framework"
        A[Connection Manager] --> B[Base Connection]
        A --> C[Connection Pool]
        A --> D[Health Checker]
        A --> E[Metrics Tracker]
        A --> F[Security Manager]

        subgraph "🌐 Connection Types"
            B --> B1[HTTP Connection]
            B --> B2[WebSocket Connection]
            B --> B3[SSE Connection]
            B --> B4[Database Connection]
        end

        subgraph "🛠️ HTTP Client System"
            G[HTTP Client] --> G1[Middleware Stack]
            G --> G2[Request/Response]
            G --> G3[Error Handling]
            G1 --> G4[Auth Middleware]
            G1 --> G5[Logging Middleware]
            G1 --> G6[Cache Middleware]
            G1 --> G7[Rate Limit Middleware]
        end

        subgraph "✅ Validation System"
            H[Validation Utils] --> H1[Schema Validation]
            H --> H2[Field Validators]
            H --> H3[Middleware System]
            H1 --> H4[Email Schema]
            H1 --> H5[Password Schema]
            H1 --> H6[URL Schema]
            H2 --> H7[Email Validator]
            H2 --> H8[Password Validator]
            H2 --> H9[Token Validator]
        end

        subgraph "⚠️ Error Handling System"
            I[Error System] --> I1[Error Classes]
            I --> I2[Error Handlers]
            I --> I3[Retry Logic]
            I --> I4[Error Reporting]
            I1 --> I5[Validation Error]
            I1 --> I6[Network Error]
            I1 --> I7[Auth Error]
            I2 --> I8[Console Handler]
            I2 --> I9[Network Handler]
            I2 --> I10[Auth Handler]
        end

        subgraph "🔄 Retry Strategies"
            J[Retry System] --> J1[Exponential Backoff]
            J --> J2[Linear Backoff]
            J --> J3[Fixed Delay]
            J --> J4[Jitter Retry]
        end

        subgraph "📊 Connection Management"
            K[Connection Pool] --> K1[Acquire/Release]
            K --> K2[Health Monitoring]
            K --> K3[Lifecycle Management]
            L[WebSocket Pool] --> L1[WebSocket Management]
            L --> L2[Connection Reuse]
        end

        subgraph "🔒 Security Features"
            M[Security Manager] --> M1[Authorization Headers]
            M --> M2[Security Levels]
            M --> M3[CSRF Protection]
            M --> M4[Rate Limiting]
        end
    end

    subgraph "📦 External Dependencies"
        N[Browser APIs] --> B2
        N --> B3
        O[Fetch API] --> B1
        P[EventSource] --> B3
    end

    A -->|Manages| Q[Application Connections]
    G -->|HTTP Requests| R[Backend Services]
    H -->|Validates| S[User Input]
    I -->|Handles| T[Error Recovery]
```

## Connection Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Manager as Connection Manager
    participant Connection as Base Connection
    participant Pool as Connection Pool
    participant Health as Health Checker
    participant Metrics as Metrics Tracker

    Note over App, Metrics: Connection Initialization
    App->>Manager: Create Connection Manager
    Manager->>Connection: Initialize Base Connection
    Connection->>Pool: Register with Pool
    Pool->>Health: Setup Health Monitoring
    Health->>Metrics: Initialize Metrics Tracking

    Note over App, Metrics: Connection Lifecycle
    App->>Manager: Connect to Service
    Manager->>Connection: connect()
    Connection->>Connection: Update State
    Connection->>Metrics: Track Connection Event
    Connection-->>Manager: Connection Established
    Manager-->>App: Connection Ready

    Note over App, Metrics: Health Monitoring
    Health->>Connection: healthCheck()
    Connection-->>Health: Health Status
    Health->>Metrics: Update Health Metrics
    Health->>Manager: Report Health Status

    Note over App, Metrics: Data Flow
    App->>Connection: send(data)
    Connection->>Connection: Process Data
    Connection->>Metrics: Track Request
    Connection-->>App: Response Data

    Note over App, Metrics: Error Handling
    Connection->>Connection: Handle Error
    Connection->>Metrics: Track Error
    Connection->>Manager: Report Error
    Manager->>Manager: Apply Retry Strategy
    Manager-->>App: Error Recovery
```

## Protocol Implementation Flow

```mermaid
flowchart TD
    A[Connection Request] --> B{Connection Type?}

    B -->|HTTP| C[HTTP Connection]
    B -->|WebSocket| D[WebSocket Connection]
    B -->|SSE| E[SSE Connection]
    B -->|Database| F[Database Connection]

    C --> C1[Fetch API]
    C1 --> C2[POST/GET Request]
    C2 --> C3[JSON Response]

    D --> D1[WebSocket API]
    D1 --> D2[Persistent Connection]
    D2 --> D3[Message Events]

    E --> E1[EventSource API]
    E1 --> E2[Server-Sent Events]
    E2 --> E3[One-way Communication]

    F --> F1[Database Driver]
    F1 --> F2[Query Execution]
    F2 --> F3[Result Set]

    C3 --> G[Response Processing]
    D3 --> G
    E3 --> G
    F3 --> G

    G --> H[Health Check]
    H --> I[Metrics Update]
    I --> J[Connection Status]
```

## ✨ Features

### 🌐 **HTTP Client System**

- **HTTPClient**: Full-featured HTTP client with middleware support
- **Middleware System**: Authentication, logging, retry logic, caching, rate limiting
- **Retry Logic**: Exponential backoff, linear backoff, fixed delay strategies
- **Circuit Breaker**: Automatic failure detection and recovery
- **Metrics**: Request monitoring and performance tracking
- **Presets**: Pre-configured client setups for common use cases

### ✅ **Validation System**

- **ValidationUtils**: Core validation engine with schema support
- **Pre-built Validators**: Email, password, URL, username, API keys, tokens
- **Schema System**: Flexible validation schemas with custom validators
- **Middleware**: Cross-field validation, conditional validation, sanitization
- **Type Safety**: Full TypeScript support with comprehensive types

### ⚠️ **Error Handling System**

- **Error Classes**: Domain-specific error types with context
- **Error Handlers**: Configurable error handling with priorities
- **Retry Logic**: Intelligent retry strategies for transient errors
- **Error Reporting**: Comprehensive error collection and reporting
- **Global Handlers**: System-wide error management

### 🔗 **Connection Management**

- **BaseConnection**: Abstract base class for all connections
- **HTTPConnection**: HTTP-specific connection implementation
- **Health Monitoring**: Connection health checks and monitoring
- **Pool Management**: Connection pooling and lifecycle management

## 📦 Installation

```bash
npm install reynard-connection
```

## 🚀 Quick Start

### HTTP Client

```typescript
import {
  HTTPClient,
  createAuthMiddleware,
  createLoggingMiddleware,
  createCacheMiddleware,
  createRateLimitMiddleware,
  createApiMiddlewareStack,
  HTTP_PRESETS,
} from "reynard-connection";

// Using presets for common configurations
const client = new HTTPClient({
  baseUrl: "https://api.example.com",
  preset: "api", // Uses optimized settings for API calls
  middleware: createApiMiddlewareStack({
    auth: {
      type: "bearer",
      token: "your-api-token",
    },
    logging: {
      logRequests: true,
      logResponses: true,
    },
    cache: {
      ttl: 300000, // 5 minutes
      maxSize: 100,
    },
    rateLimit: {
      requestsPerMinute: 60,
      burstLimit: 120,
    },
  }),
});

// Make requests with automatic retry, caching, and rate limiting
const response = await client.get("/users");
const user = await client.post("/users", { name: "John Doe" });
```

### Advanced HTTP Client with Custom Middleware

```typescript
import {
  HTTPClient,
  createAuthMiddleware,
  createTokenRefreshMiddleware,
  createErrorHandlingMiddleware,
  createRequestIdMiddleware,
  createUserAgentMiddleware,
} from "reynard-connection";

// Create an HTTP client for authentication flows
const authClient = new HTTPClient({
  baseUrl: "https://auth.example.com",
  timeout: 30000,
  retries: 3,
  enableRetry: true,
  enableCircuitBreaker: true,
  enableMetrics: true,
  middleware: [
    createRequestIdMiddleware(),
    createUserAgentMiddleware("ReynardApp/1.0"),
    createAuthMiddleware({
      type: "bearer",
      token: () => tokenManager.getAccessToken(), // Dynamic token
    }),
    createTokenRefreshMiddleware({
      refreshEndpoint: "/auth/refresh",
      refreshToken: () => tokenManager.getRefreshToken(),
      onTokenRefresh: newToken => tokenManager.setTokens(newToken),
      onTokenExpired: () => handleLogout(),
    }),
    createErrorHandlingMiddleware({
      onError: error => {
        if (error.status === 401) {
          handleUnauthorized();
        }
      },
    }),
  ],
});
```

### Validation

```typescript
import {
  ValidationUtils,
  validateEmail,
  validatePassword,
  emailSchema,
  passwordSchema,
  createCrossFieldMiddleware,
  createSanitizationMiddleware,
  passwordConfirmationMiddleware,
} from "reynard-connection";

// Simple validation
const emailResult = validateEmail("user@example.com");
if (!emailResult.isValid) {
  console.error(emailResult.error);
}

// Schema-based validation with middleware
const userSchema = {
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
};

const validationMiddleware = [
  createSanitizationMiddleware({
    email: ["trim", "lowercase"],
    password: ["trim"],
  }),
  passwordConfirmationMiddleware("password", "confirmPassword"),
  createCrossFieldMiddleware(data => {
    if (data.email && data.email.includes("test")) {
      return { isValid: false, error: "Test emails not allowed" };
    }
    return { isValid: true };
  }),
];

const result = ValidationUtils.validateMultiple(
  {
    email: "  USER@EXAMPLE.COM  ",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  },
  userSchema,
  { middleware: validationMiddleware }
);

console.log(result.isValid); // true
console.log(result.data); // { email: "user@example.com", password: "SecurePass123!", confirmPassword: "SecurePass123!" }
```

### Error Handling

```typescript
import {
  errorHandler,
  ValidationError,
  NetworkError,
  retryWithExponentialBackoff,
  createErrorHandlerSystem,
  setupGlobalErrorReporting,
  ErrorReporter,
} from "reynard-connection";

// Set up global error handling
const errorSystem = createErrorHandlerSystem({
  enableConsoleLogging: true,
  onValidationError: error => console.warn("Validation error:", error),
  onNetworkError: error => console.error("Network error:", error),
  onAuthenticationError: error => {
    console.error("Auth error:", error);
    // Redirect to login
  },
});

// Set up error reporting
setupGlobalErrorReporting({
  enabled: true,
  endpoint: "https://errors.example.com/api/errors",
  apiKey: "your-error-reporting-key",
  batchSize: 10,
  flushInterval: 30000,
  includeStackTraces: true,
  includeEnvironmentInfo: true,
});

// Create domain-specific errors with context
const validationError = new ValidationError("Invalid email format", {
  field: "email",
  value: "invalid-email",
  constraint: "email_format",
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
});

// Handle errors globally
await errorHandler(validationError);

// Retry with exponential backoff and custom conditions
try {
  const result = await retryWithExponentialBackoff(
    async () => {
      return await fetch("/api/data");
    },
    3, // max retries
    1000, // base delay
    error => {
      // Custom retry condition
      return error.status >= 500 || error.status === 429;
    }
  );
} catch (error) {
  console.error("Failed after retries:", error);
}
```

## 🔧 Real-World Integration Examples

### Authentication Package Integration

```typescript
// packages/auth/src/utils/api-utils.ts
import {
  HTTPClient,
  createAuthMiddleware,
  createTokenRefreshMiddleware,
  createErrorHandlingMiddleware,
} from "reynard-connection";

export const createAuthHTTPClient = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  onUnauthorized: () => void,
  onTokenRefresh: () => Promise<void>
): HTTPClient => {
  return new HTTPClient({
    baseUrl: config.apiBaseUrl || "",
    preset: "auth", // Optimized for authentication flows
    middleware: [
      createAuthMiddleware({
        type: "bearer",
        token: tokenManager.getAccessToken() || undefined,
      }),
      createTokenRefreshMiddleware({
        refreshEndpoint: `${config.apiBaseUrl}/auth/refresh`,
        refreshToken: tokenManager.getRefreshToken() || "",
        onTokenRefresh: (newToken: string) => {
          tokenManager.setTokens(newToken);
          onTokenRefresh();
        },
        onTokenExpired: () => {
          onUnauthorized();
        },
      }),
      createErrorHandlingMiddleware({
        onError: error => {
          if (error.status === 401) {
            onUnauthorized();
          }
        },
      }),
    ],
  });
};
```

### Settings Package Integration

```typescript
// packages/settings/src/utils/index.ts
import { ValidationUtils, validateEmail, validateUrl, validateTheme, type ValidationSchema } from "reynard-connection";

export function validateSetting(definition: SettingDefinition, value: any): ValidationResult {
  // Map setting types to validation schemas
  const schemaMap: Record<string, ValidationSchema> = {
    email: { type: "email", required: definition.required },
    url: { type: "url", required: definition.required },
    theme: {
      type: "string",
      enum: ["light", "dark", "auto"],
      required: definition.required,
    },
    // ... other mappings
  };

  const schema = schemaMap[definition.type] || {
    type: definition.type as any,
    required: definition.required,
  };

  return ValidationUtils.validateValue(value, schema, {
    field: definition.key,
  });
}
```

### Tools Package Integration

```typescript
// packages/tools/src/core/BaseTool.ts
import { ValidationUtils, ValidationError, type ValidationSchema } from "reynard-connection";

export abstract class BaseTool {
  protected validateParameter(param: ToolParameter, value: any): void {
    const schema: ValidationSchema = {
      type: this.mapParameterType(param.type),
      required: param.required,
      minLength: param.minLength,
      maxLength: param.maxLength,
      min: param.minimum,
      max: param.maximum,
      pattern: param.pattern ? new RegExp(param.pattern) : undefined,
      enum: param.enum,
    };

    const result = ValidationUtils.validateValue(value, schema, {
      field: param.name,
      strict: true, // Throw errors for tool parameters
    });

    if (!result.isValid) {
      throw new ValidationError(result.error || "Invalid parameter", {
        field: param.name,
        value,
        constraint: "parameter_validation",
      });
    }
  }

  private mapParameterType(type: ParameterType): string {
    const typeMap = {
      [ParameterType.STRING]: "string",
      [ParameterType.NUMBER]: "number",
      [ParameterType.INTEGER]: "number",
      [ParameterType.BOOLEAN]: "boolean",
      [ParameterType.ARRAY]: "array",
      [ParameterType.OBJECT]: "object",
    };
    return typeMap[type] || "string";
  }
}
```

## 📚 API Reference

### HTTP Client

#### HTTPClient

```typescript
class HTTPClient {
  constructor(config: HTTPClientConfig);

  // Request methods
  request<T>(options: HTTPRequestOptions): Promise<HTTPResponse<T>>;
  get<T>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
  post<T>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
  put<T>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
  patch<T>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
  delete<T>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;

  // Middleware management
  addMiddleware(middleware: HTTPMiddleware): void;
  removeMiddleware(middleware: HTTPMiddleware): void;
  clearMiddleware(): void;

  // Configuration
  updateConfig(newConfig: Partial<HTTPClientConfig>): void;

  // Metrics
  getMetrics(): HTTPMetrics;
  resetMetrics(): void;
}
```

#### HTTP Presets

```typescript
// Pre-configured client setups
const presets = {
  default: {
    timeout: 30000,
    retries: 3,
    enableRetry: true,
    enableCircuitBreaker: true,
    enableMetrics: true,
  },
  api: {
    timeout: 15000,
    retries: 2,
    enableRetry: true,
    enableCircuitBreaker: true,
    enableMetrics: true,
  },
  auth: {
    timeout: 10000,
    retries: 1,
    enableRetry: true,
    enableCircuitBreaker: false,
    enableMetrics: false,
  },
  upload: {
    timeout: 300000, // 5 minutes
    retries: 1,
    enableRetry: true,
    enableCircuitBreaker: false,
    enableMetrics: true,
  },
};
```

#### Middleware

```typescript
// Authentication middleware
const authMiddleware = createAuthMiddleware({
  type: "bearer",
  token: "your-token", // or function that returns token
});

// Logging middleware
const loggingMiddleware = createLoggingMiddleware({
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

// Caching middleware
const cacheMiddleware = createCacheMiddleware({
  ttl: 300000, // 5 minutes
  maxSize: 100,
});

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware({
  requestsPerMinute: 60,
  burstLimit: 120,
});

// Pre-configured middleware stacks
const apiStack = createApiMiddlewareStack({
  auth: { type: "bearer", token: "token" },
  logging: { logRequests: true },
  cache: { ttl: 300000 },
  rateLimit: { requestsPerMinute: 60 },
});

const uploadStack = createUploadMiddlewareStack({
  auth: { type: "bearer", token: "token" },
  logging: { logRequests: true },
});
```

### Validation System

#### ValidationUtils

```typescript
class ValidationUtils {
  // Core validation
  static validateValue(value: unknown, schema: ValidationSchema, options?: FieldValidationOptions): ValidationResult;
  static validateMultiple(
    data: Record<string, unknown>,
    schemas: Record<string, ValidationSchema>,
    options?: FieldValidationOptions
  ): MultiValidationResult;

  // Helper methods
  private static isEmpty(value: unknown): boolean;
  private static isValidType(value: unknown, type: string): boolean;
}
```

#### Pre-built Validators

```typescript
// Basic validators
validateEmail(email: string, fieldName?: string): ValidationResult;
validatePassword(password: string, fieldName?: string): ValidationResult;
validateUrl(url: string, fieldName?: string): ValidationResult;
validateUsername(username: string, fieldName?: string): ValidationResult;

// API validators
validateApiKey(apiKey: string, fieldName?: string): ValidationResult;
validateToken(token: string, fieldName?: string): ValidationResult;

// AI/ML validators
validateModelName(modelName: string, fieldName?: string): ValidationResult;
validatePrompt(prompt: string, fieldName?: string): ValidationResult;
validateTemperature(temperature: number, fieldName?: string): ValidationResult;
validateMaxTokens(maxTokens: number, fieldName?: string): ValidationResult;

// UI/UX validators
validateTheme(theme: string, fieldName?: string): ValidationResult;
validateLanguage(language: string, fieldName?: string): ValidationResult;
validateColor(color: string, fieldName?: string): ValidationResult;
```

#### Validation Schemas

```typescript
// Pre-defined schemas
const emailSchema: ValidationSchema;
const passwordSchema: ValidationSchema;
const usernameSchema: ValidationSchema;
const urlSchema: ValidationSchema;
const apiKeySchema: ValidationSchema;
const tokenSchema: ValidationSchema;
const modelNameSchema: ValidationSchema;
const promptSchema: ValidationSchema;
const temperatureSchema: ValidationSchema;
const maxTokensSchema: ValidationSchema;
const themeSchema: ValidationSchema;
const languageSchema: ValidationSchema;
const colorSchema: ValidationSchema;

// Schema utilities
createSchema(baseSchema: ValidationSchema, customErrorMessage?: string): ValidationSchema;
makeOptional(schema: ValidationSchema): ValidationSchema;
makeRequired(schema: ValidationSchema): ValidationSchema;
withLength(schema: ValidationSchema, minLength?: number, maxLength?: number): ValidationSchema;
withRange(schema: ValidationSchema, min?: number, max?: number): ValidationSchema;
```

#### Validation Middleware

```typescript
// Cross-field validation
const crossFieldMiddleware = createCrossFieldMiddleware(data => {
  if (data.password !== data.confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
});

// Conditional validation
const conditionalMiddleware = createConditionalMiddleware(data => data.role === "admin", {
  permissions: { type: "array", required: true },
});

// Sanitization
const sanitizationMiddleware = createSanitizationMiddleware({
  email: ["trim", "lowercase"],
  name: ["trim", "titlecase"],
  description: ["trim", "htmlSanitize"],
});

// Business rules
const businessRuleMiddleware = createBusinessRuleMiddleware([
  passwordConfirmationMiddleware("password", "confirmPassword"),
  emailConfirmationMiddleware("email", "confirmEmail"),
  dateRangeMiddleware("startDate", "endDate"),
  numericRangeMiddleware("minValue", "maxValue"),
]);
```

### Error Handling System

#### Error Classes

```typescript
// Base error class
class ReynardError extends Error {
  code: string;
  context: BaseErrorContext;
  timestamp: number;
}

// Domain-specific errors
class ValidationError extends ReynardError;
class NetworkError extends ReynardError;
class AuthenticationError extends ReynardError;
class AuthorizationError extends ReynardError;
class ProcessingError extends ReynardError;
class DatabaseError extends ReynardError;
class ConfigurationError extends ReynardError;
class TimeoutError extends ReynardError;
class RateLimitError extends ReynardError;
```

#### Error Handlers

```typescript
// Global error handler
await errorHandler(error: unknown, context?: Record<string, unknown>): Promise<void>;

// Error handler system
const system = createErrorHandlerSystem({
  enableConsoleLogging: true,
  onValidationError: (error) => console.warn("Validation error:", error),
  onNetworkError: (error) => console.error("Network error:", error),
  onAuthenticationError: (error) => console.error("Auth error:", error),
});

// Wrap async functions with error handling
const result = await wrapAsync(
  () => riskyOperation(),
  "Operation failed",
  { operation: "riskyOperation" }
);
```

#### Retry Logic

```typescript
// Retry strategies
const result = await retry(fn, {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error) => isRetryableError(error),
});

// Convenience methods
await retryWithExponentialBackoff(fn, maxRetries, baseDelay);
await retryWithLinearBackoff(fn, maxRetries, baseDelay);
await retryWithFixedDelay(fn, maxRetries, delay);

// Decorators
@withRetry(exponentialBackoffStrategy)
async function apiCall() { /* ... */ }

@withExponentialBackoff(3, 1000)
async function networkOperation() { /* ... */ }
```

#### Error Reporting

```typescript
// Set up error reporting
setupGlobalErrorReporting({
  enabled: true,
  endpoint: "https://errors.example.com/api/errors",
  apiKey: "your-api-key",
  batchSize: 10,
  flushInterval: 30000,
  includeStackTraces: true,
  includeUserInfo: true,
  includeEnvironmentInfo: true,
  filters: [
    createErrorCodeFilter(["VALIDATION_ERROR", "NETWORK_ERROR"]),
    createErrorSourceFilter(["user-input", "api-calls"]),
  ],
});

// Manual error reporting
const reporter = new ErrorReporter({
  endpoint: "https://errors.example.com/api/errors",
  apiKey: "your-api-key",
});

await reporter.reportError(error, {
  userId: "user123",
  sessionId: "session456",
  feature: "user-registration",
});
```

## 🔧 Configuration

### HTTP Client Configuration

```typescript
interface HTTPClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
  authToken?: string;
  enableRetry?: boolean;
  enableCircuitBreaker?: boolean;
  enableMetrics?: boolean;
  middleware?: HTTPMiddleware[];
  preset?: string; // "default" | "api" | "auth" | "upload"
}
```

### Validation Configuration

```typescript
interface FieldValidationOptions {
  fieldName?: string;
  context?: ValidationErrorContext;
  strict?: boolean;
  allowEmpty?: boolean;
  middleware?: ValidationMiddleware[];
}
```

### Error Handling Configuration

```typescript
interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  includeStackTraces: boolean;
  includeUserInfo: boolean;
  includeEnvironmentInfo: boolean;
  filters: ErrorFilter[];
}
```

## 🎯 Best Practices

### HTTP Client

1. **Use Presets**: Leverage pre-configured presets for common use cases
2. **Use Middleware**: Leverage middleware for cross-cutting concerns
3. **Handle Errors**: Always handle HTTP errors appropriately
4. **Monitor Performance**: Use metrics to track request performance
5. **Configure Timeouts**: Set appropriate timeouts for different operations
6. **Use Retry Logic**: Implement retry for transient failures
7. **Circuit Breakers**: Enable circuit breakers for external services

### Validation

1. **Use Schemas**: Define validation schemas for complex objects
2. **Validate Early**: Validate input as early as possible
3. **Provide Feedback**: Give clear error messages to users
4. **Use Type Guards**: Leverage TypeScript for compile-time safety
5. **Test Edge Cases**: Test validation with edge cases and malformed data
6. **Use Middleware**: Leverage validation middleware for complex rules
7. **Sanitize Input**: Always sanitize user input before processing

### Error Handling

1. **Use Specific Errors**: Use domain-specific error types
2. **Include Context**: Provide context in error objects
3. **Handle Globally**: Use global error handlers for consistency
4. **Log Appropriately**: Log errors with appropriate levels
5. **Retry Intelligently**: Use retry logic for transient errors
6. **Report Errors**: Set up error reporting for production monitoring
7. **Filter Sensitive Data**: Don't include sensitive data in error reports

## 🔄 Migration Guide

### From Old Validation Systems

```typescript
// Old way
import { ValidationUtils as OldValidationUtils } from "reynard-ai-shared";

// New way
import { ValidationUtils, validateEmail } from "reynard-connection";
```

### From Old HTTP Systems

```typescript
// Old way
const response = await fetch(url, options);

// New way
import { HTTPClient } from "reynard-connection";
const client = new HTTPClient({ baseUrl: "https://api.example.com" });
const response = await client.get("/endpoint");
```

### From Old Error Systems

```typescript
// Old way
throw new Error("Something went wrong");

// New way
import { ValidationError, NetworkError } from "reynard-connection";
throw new ValidationError("Invalid input", { field: "email" });
```

## 🧪 Testing

The connection package includes comprehensive tests for all functionality:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --grep "HTTP Client"
npm test -- --grep "Validation"
npm test -- --grep "Error Handling"
```

## 📈 Performance

The connection package is optimized for performance:

- **HTTP Client**: Efficient request handling with connection pooling
- **Validation**: Fast validation with minimal overhead
- **Error Handling**: Lightweight error objects with lazy evaluation
- **Middleware**: Composable middleware with minimal performance impact
- **Caching**: Built-in caching for frequently accessed data
- **Circuit Breakers**: Automatic failure detection and recovery

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

This package is part of the Reynard framework and is licensed under the same terms as the main project.

---

> Built with 🦊 by the Reynard team
