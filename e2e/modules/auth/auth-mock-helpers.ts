/**
 * Authentication Mock Helpers for E2E Testing
 *
 * Provides specialized mock helpers for authentication-related testing scenarios.
 */

import { MockApiClient } from "../mock";

/**
 * User data interface for authentication operations
 */
interface UserData {
  username: string;
  email: string;
  role?: string;
  permissions?: string[];
}

/**
 * Registration response interface
 */
interface RegistrationResponse {
  user: {
    id: string;
    username: string;
    email: string;
    is_active: boolean;
    created_at: string;
  };
}

/**
 * Login response interface
 */
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * Token refresh response interface
 */
interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * User profile response interface
 */
interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  role: string;
  permissions: string[];
}

/**
 * Error response interface
 */
interface ErrorResponse {
  detail: string;
}

/**
 * Success message response interface
 */
interface SuccessResponse {
  message: string;
}

/**
 * Authentication-specific mock helpers
 */
export class AuthMockHelpers {
  private readonly apiClient: MockApiClient;

  constructor(apiClient: MockApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Mock successful user registration
   */
  mockSuccessfulRegistration(userData: UserData): void {
    this.apiClient.setMockResponse("/api/auth/register", {
      status: 201,
      body: {
        user: {
          id: "123",
          username: userData.username,
          email: userData.email,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      } as RegistrationResponse,
    });
  }

  /**
   * Mock successful user login
   */
  mockSuccessfulLogin(_userData: UserData): void {
    this.apiClient.setMockResponse("/api/auth/login", {
      status: 200,
      body: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        token_type: "bearer",
      } as LoginResponse,
    });
  }

  /**
   * Mock authentication failure
   */
  mockAuthenticationFailure(): void {
    this.apiClient.setMockResponse("/api/auth/login", {
      status: 401,
      body: { detail: "Incorrect username or password" } as ErrorResponse,
    });
  }

  /**
   * Mock rate limiting
   */
  mockRateLimit(): void {
    this.apiClient.setMockResponse("/api/auth/login", {
      status: 429,
      body: { detail: "Too many login attempts" } as ErrorResponse,
    });
  }

  /**
   * Mock token refresh
   */
  mockTokenRefresh(): void {
    this.apiClient.setMockResponse("/api/auth/refresh", {
      status: 200,
      body: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        token_type: "bearer",
      } as TokenRefreshResponse,
    });
  }

  /**
   * Mock invalid refresh token
   */
  mockInvalidRefreshToken(): void {
    this.apiClient.setMockResponse("/api/auth/refresh", {
      status: 401,
      body: { detail: "Invalid refresh token" } as ErrorResponse,
    });
  }

  /**
   * Mock successful logout
   */
  mockSuccessfulLogout(): void {
    this.apiClient.setMockResponse("/api/auth/logout", {
      status: 200,
      body: { message: "Successfully logged out" } as SuccessResponse,
    });
  }

  /**
   * Mock user profile data
   */
  mockUserProfile(userData: UserData): void {
    this.apiClient.setMockResponse("/api/auth/me", {
      status: 200,
      body: {
        id: "123",
        username: userData.username,
        email: userData.email,
        is_active: true,
        role: userData.role || "user",
        permissions: userData.permissions || [],
      } as UserProfileResponse,
    });
  }
}
