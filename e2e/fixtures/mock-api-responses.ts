/**
 * Mock API Response Data
 *
 * Provides mock API responses for testing authentication flows,
 * error scenarios, and various HTTP status codes.
 */

import type { ITestUserData } from "./user-data";

/**
 * API Response Interface
 */
export interface IApiResponse {
  status: number;
  body: any;
}

/**
 * Mock API Response Data Factory
 */
export class MockApiResponses {
  /**
   * Get successful registration response
   */
  static getSuccessfulRegistration(userData: ITestUserData): IApiResponse {
    return {
      status: 201,
      body: {
        user: {
          id: "123",
          username: userData.username,
          email: userData.email,
          full_name: userData.fullName,
          is_active: userData.isActive,
          role: userData.role,
          permissions: userData.permissions,
          created_at: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Get successful login response
   */
  static getSuccessfulLogin(): IApiResponse {
    return {
      status: 200,
      body: {
        access_token: "mock-access-token-12345",
        refresh_token: "mock-refresh-token-67890",
        token_type: "bearer",
        expires_in: 3600,
      },
    };
  }

  /**
   * Get authentication failure response
   */
  static getAuthenticationFailure(): IApiResponse {
    return {
      status: 401,
      body: {
        detail: "Incorrect username or password",
      },
    };
  }

  /**
   * Get rate limiting response
   */
  static getRateLimitResponse(): IApiResponse {
    return {
      status: 429,
      body: {
        detail: "Too many login attempts. Please try again later.",
        retry_after: 60,
      },
    };
  }

  /**
   * Get token refresh response
   */
  static getTokenRefreshResponse(): IApiResponse {
    return {
      status: 200,
      body: {
        access_token: "new-access-token-54321",
        refresh_token: "new-refresh-token-09876",
        token_type: "bearer",
        expires_in: 3600,
      },
    };
  }

  /**
   * Get invalid refresh token response
   */
  static getInvalidRefreshTokenResponse(): IApiResponse {
    return {
      status: 401,
      body: {
        detail: "Invalid refresh token",
      },
    };
  }

  /**
   * Get user profile response
   */
  static getUserProfileResponse(userData: ITestUserData): IApiResponse {
    return {
      status: 200,
      body: {
        id: "123",
        username: userData.username,
        email: userData.email,
        full_name: userData.fullName,
        is_active: userData.isActive,
        role: userData.role,
        permissions: userData.permissions,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      },
    };
  }

  /**
   * Get successful logout response
   */
  static getSuccessfulLogoutResponse(): IApiResponse {
    return {
      status: 200,
      body: {
        message: "Successfully logged out",
      },
    };
  }

  /**
   * Get validation error response
   */
  static getValidationErrorResponse(errors: Record<string, string[]>): IApiResponse {
    return {
      status: 422,
      body: {
        detail: "Validation error",
        errors,
      },
    };
  }

  /**
   * Get server error response
   */
  static getServerErrorResponse(): IApiResponse {
    return {
      status: 500,
      body: {
        detail: "Internal server error",
      },
    };
  }

  /**
   * Get network error response
   */
  static getNetworkErrorResponse(): IApiResponse {
    return {
      status: 0,
      body: null,
    };
  }
}
