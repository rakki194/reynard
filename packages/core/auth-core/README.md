# Reynard Auth Core

Core authentication logic and utilities for the Reynard ecosystem. This package provides the foundational authentication functionality that can be used across different frameworks and environments.

## Features

- **Token Management**: Secure JWT token storage and management
- **Authentication Client**: HTTP client for authentication endpoints
- **Auth Orchestrator**: High-level authentication flow management
- **Type Safety**: Comprehensive TypeScript interfaces and types
- **Configurable**: Flexible configuration for different use cases
- **Framework Agnostic**: Core logic that works with any framework

## Installation

```bash
pnpm add reynard-auth-core
```

## Basic Usage

```typescript
import { AuthOrchestrator, AuthTokenManager, AuthClient } from "reynard-auth-core";

// Create token manager
const tokenManager = new AuthTokenManager({
  storageKey: "auth_tokens",
  refreshThreshold: 300, // Refresh 5 minutes before expiry
});

// Create auth client
const authClient = new AuthClient({
  baseUrl: "https://api.example.com",
  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
});

// Create orchestrator
const authOrchestrator = new AuthOrchestrator({
  tokenManager,
  authClient,
  autoRefresh: true,
});

// Initialize authentication
await authOrchestrator.initialize();

// Login
const result = await authOrchestrator.login({
  identifier: "user@example.com",
  password: "password123",
});

if (result.success) {
  console.log("Login successful:", result.user);
} else {
  console.error("Login failed:", result.error);
}
```

## Configuration

### AuthConfig

```typescript
interface AuthConfig {
  apiBaseUrl: string;
  endpoints?: {
    login?: string;
    register?: string;
    refresh?: string;
    logout?: string;
    changePassword?: string;
  };
  autoRefresh?: boolean;
  refreshThreshold?: number;
  enableRememberMe?: boolean;
  rememberMeDuration?: number;
}
```

### TokenManagerConfig

```typescript
interface TokenManagerConfig {
  storageKey?: string;
  refreshThreshold?: number;
  enableRememberMe?: boolean;
  rememberMeDuration?: number;
}
```

## Token Management

The `AuthTokenManager` handles secure token storage and management:

```typescript
import { AuthTokenManager } from "reynard-auth-core";

const tokenManager = new AuthTokenManager({
  storageKey: "my_app_tokens",
  refreshThreshold: 300, // 5 minutes
});

// Store tokens
await tokenManager.setTokens({
  accessToken: "eyJ...",
  refreshToken: "eyJ...",
  expiresAt: Date.now() + 3600000, // 1 hour
});

// Get access token
const accessToken = tokenManager.getAccessToken();

// Check if token is expired
const isExpired = tokenManager.isTokenExpired();

// Refresh tokens
const refreshed = await tokenManager.refreshTokens();
```

## Authentication Client

The `AuthClient` handles HTTP communication with authentication endpoints:

```typescript
import { AuthClient } from "reynard-auth-core";

const authClient = new AuthClient({
  baseUrl: "https://api.example.com",
  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
});

// Login
const loginResult = await authClient.login({
  identifier: "user@example.com",
  password: "password123",
});

// Register
const registerResult = await authClient.register({
  username: "newuser",
  email: "newuser@example.com",
  password: "password123",
  fullName: "New User",
});

// Refresh tokens
const refreshResult = await authClient.refreshTokens("refresh_token_here");

// Logout
await authClient.logout();
```

## Auth Orchestrator

The `AuthOrchestrator` provides high-level authentication flow management:

```typescript
import { AuthOrchestrator } from "reynard-auth-core";

const orchestrator = new AuthOrchestrator({
  tokenManager,
  authClient,
  autoRefresh: true,
});

// Initialize (check for existing tokens)
await orchestrator.initialize();

// Login with automatic token management
const result = await orchestrator.login({
  identifier: "user@example.com",
  password: "password123",
});

// Register new user
const registerResult = await orchestrator.register({
  username: "newuser",
  email: "newuser@example.com",
  password: "password123",
  fullName: "New User",
});

// Logout and clear tokens
await orchestrator.logout();

// Change password
await orchestrator.changePassword({
  currentPassword: "oldpassword",
  newPassword: "newpassword",
});
```

## Types and Interfaces

### User Interface

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role?: string;
  createdAt: string;
  lastLogin?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}
```

### Login Credentials

```typescript
interface LoginCredentials {
  identifier: string; // Username or email
  password: string;
  rememberMe?: boolean;
}
```

### Register Data

```typescript
interface RegisterData {
  username: string;
  email?: string;
  password: string;
  fullName?: string;
  acceptTerms?: boolean;
}
```

### Auth Result

```typescript
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}
```

## Error Handling

The auth core provides structured error handling:

```typescript
try {
  const result = await orchestrator.login(credentials);
  if (!result.success) {
    console.error("Login failed:", result.error);
  }
} catch (error) {
  if (error instanceof AuthError) {
    console.error("Auth error:", error.message);
    console.error("Code:", error.code);
  }
}
```

## Integration with HTTP Client

The auth core integrates seamlessly with the Reynard HTTP Client:

```typescript
import { HTTPClient, createAuthMiddleware } from "reynard-http-client";
import { AuthTokenManager } from "reynard-auth-core";

const tokenManager = new AuthTokenManager();
const httpClient = new HTTPClient({
  baseUrl: "https://api.example.com",
});

// Add auth middleware
httpClient.use(createAuthMiddleware({
  type: "bearer",
  getToken: () => tokenManager.getAccessToken(),
}));
```

## Testing

The auth core includes comprehensive test utilities:

```typescript
import { createMockAuthClient } from "reynard-auth-core/testing";

const mockAuthClient = createMockAuthClient();
mockAuthClient.mockLogin({
  identifier: "test@example.com",
  password: "password123",
}, {
  success: true,
  user: { id: "1", username: "test", email: "test@example.com" },
  tokens: {
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token",
    expiresAt: Date.now() + 3600000,
  },
});

// Use in tests
const result = await mockAuthClient.login({
  identifier: "test@example.com",
  password: "password123",
});
expect(result.success).toBe(true);
```

## Security Considerations

- **Token Storage**: Tokens are stored securely in localStorage with proper expiration handling
- **Refresh Logic**: Automatic token refresh prevents session expiration
- **Password Security**: Passwords are never stored locally
- **HTTPS Only**: All authentication requests should use HTTPS in production
- **Token Validation**: JWT tokens are validated before use

## API Reference

### Classes

- `AuthTokenManager` - Token storage and management
- `AuthClient` - HTTP client for auth endpoints
- `AuthOrchestrator` - High-level auth flow management

### Interfaces

- `AuthConfig` - Main configuration interface
- `TokenManagerConfig` - Token manager configuration
- `User` - User data structure
- `LoginCredentials` - Login request data
- `RegisterData` - Registration request data
- `AuthResult` - Authentication result

### Types

- `AuthState` - Authentication state enum
- `AuthError` - Authentication error class

## License

MIT License - see LICENSE file for details.
