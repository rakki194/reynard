/**
 * Test Data Fixtures for E2E Authentication Testing
 * 
 * Provides comprehensive test data for authentication scenarios including
 * valid users, invalid users, edge cases, and security test cases.
 */

/**
 * Test User Data Interface
 */
export interface TestUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: 'user' | 'admin' | 'moderator';
  permissions?: string[];
  isActive?: boolean;
}

/**
 * Test User Data Factory
 */
export class TestUserData {
  /**
   * Get a valid test user
   */
  static getValidUser(): TestUserData {
    return {
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecurePassword123!',
      fullName: 'Test User',
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get an admin test user
   */
  static getAdminUser(): TestUserData {
    return {
      username: 'admin',
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      fullName: 'Admin User',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      isActive: true,
    };
  }

  /**
   * Get a moderator test user
   */
  static getModeratorUser(): TestUserData {
    return {
      username: 'moderator',
      email: 'moderator@example.com',
      password: 'ModeratorPassword123!',
      fullName: 'Moderator User',
      role: 'moderator',
      permissions: ['read', 'write', 'moderate'],
      isActive: true,
    };
  }

  /**
   * Get an invalid test user (for validation testing)
   */
  static getInvalidUser(): TestUserData {
    return {
      username: 'a', // Too short
      email: 'invalid-email', // Invalid email format
      password: '123', // Too weak
      fullName: '',
      role: 'user',
      permissions: [],
      isActive: true,
    };
  }

  /**
   * Get a user with weak password
   */
  static getWeakPasswordUser(): TestUserData {
    return {
      username: 'weakuser',
      email: 'weak@example.com',
      password: '123456',
      fullName: 'Weak User',
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get a user with special characters in username
   */
  static getSpecialCharUser(): TestUserData {
    return {
      username: 'user@#$%',
      email: 'special@example.com',
      password: 'SecurePassword123!',
      fullName: 'Special User',
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get a user with very long data
   */
  static getLongDataUser(): TestUserData {
    const longString = 'a'.repeat(1000);
    return {
      username: longString,
      email: `${longString}@example.com`,
      password: 'SecurePassword123!',
      fullName: longString,
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get a user with XSS attempt
   */
  static getXSSUser(): TestUserData {
    return {
      username: '<script>alert("xss")</script>',
      email: 'xss@example.com<script>alert("xss")</script>',
      password: 'SecurePassword123!',
      fullName: '<img src=x onerror=alert("xss")>',
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get a user with SQL injection attempt
   */
  static getSQLInjectionUser(): TestUserData {
    return {
      username: "admin'; DROP TABLE users; --",
      email: "sql@example.com'; DROP TABLE users; --",
      password: 'SecurePassword123!',
      fullName: "'; DROP TABLE users; --",
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get a user with Unicode characters
   */
  static getUnicodeUser(): TestUserData {
    return {
      username: '用户测试',
      email: 'unicode@example.com',
      password: 'SecurePassword123!',
      fullName: '测试用户 🦊',
      role: 'user',
      permissions: ['read'],
      isActive: true,
    };
  }

  /**
   * Get an inactive user
   */
  static getInactiveUser(): TestUserData {
    return {
      username: 'inactive',
      email: 'inactive@example.com',
      password: 'SecurePassword123!',
      fullName: 'Inactive User',
      role: 'user',
      permissions: ['read'],
      isActive: false,
    };
  }

  /**
   * Get multiple test users
   */
  static getMultipleUsers(count: number = 5): TestUserData[] {
    return Array.from({ length: count }, (_, index) => ({
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      password: 'SecurePassword123!',
      fullName: `User ${index + 1}`,
      role: 'user' as const,
      permissions: ['read'],
      isActive: true,
    }));
  }
}

/**
 * Mock API Response Data
 */
export class MockApiResponses {
  /**
   * Get successful registration response
   */
  static getSuccessfulRegistration(userData: TestUserData): any {
    return {
      status: 201,
      body: {
        user: {
          id: '123',
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
  static getSuccessfulLogin(): any {
    return {
      status: 200,
      body: {
        access_token: 'mock-access-token-12345',
        refresh_token: 'mock-refresh-token-67890',
        token_type: 'bearer',
        expires_in: 3600,
      },
    };
  }

  /**
   * Get authentication failure response
   */
  static getAuthenticationFailure(): any {
    return {
      status: 401,
      body: {
        detail: 'Incorrect username or password',
      },
    };
  }

  /**
   * Get rate limiting response
   */
  static getRateLimitResponse(): any {
    return {
      status: 429,
      body: {
        detail: 'Too many login attempts. Please try again later.',
        retry_after: 60,
      },
    };
  }

  /**
   * Get token refresh response
   */
  static getTokenRefreshResponse(): any {
    return {
      status: 200,
      body: {
        access_token: 'new-access-token-54321',
        refresh_token: 'new-refresh-token-09876',
        token_type: 'bearer',
        expires_in: 3600,
      },
    };
  }

  /**
   * Get invalid refresh token response
   */
  static getInvalidRefreshTokenResponse(): any {
    return {
      status: 401,
      body: {
        detail: 'Invalid refresh token',
      },
    };
  }

  /**
   * Get user profile response
   */
  static getUserProfileResponse(userData: TestUserData): any {
    return {
      status: 200,
      body: {
        id: '123',
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
  static getSuccessfulLogoutResponse(): any {
    return {
      status: 200,
      body: {
        message: 'Successfully logged out',
      },
    };
  }

  /**
   * Get validation error response
   */
  static getValidationErrorResponse(errors: Record<string, string[]>): any {
    return {
      status: 422,
      body: {
        detail: 'Validation error',
        errors,
      },
    };
  }

  /**
   * Get server error response
   */
  static getServerErrorResponse(): any {
    return {
      status: 500,
      body: {
        detail: 'Internal server error',
      },
    };
  }

  /**
   * Get network error response
   */
  static getNetworkErrorResponse(): any {
    return {
      status: 0,
      body: null,
    };
  }
}

/**
 * Test Scenarios Data
 */
export class TestScenarios {
  /**
   * Get authentication flow scenarios
   */
  static getAuthFlowScenarios(): Array<{
    name: string;
    description: string;
    userData: TestUserData;
    expectedResult: 'success' | 'failure';
    expectedError?: string;
  }> {
    return [
      {
        name: 'valid_user_registration',
        description: 'Register a new user with valid data',
        userData: TestUserData.getValidUser(),
        expectedResult: 'success',
      },
      {
        name: 'invalid_user_registration',
        description: 'Register a user with invalid data',
        userData: TestUserData.getInvalidUser(),
        expectedResult: 'failure',
        expectedError: 'Validation error',
      },
      {
        name: 'valid_user_login',
        description: 'Login with valid credentials',
        userData: TestUserData.getValidUser(),
        expectedResult: 'success',
      },
      {
        name: 'invalid_user_login',
        description: 'Login with invalid credentials',
        userData: { ...TestUserData.getValidUser(), password: 'wrongpassword' },
        expectedResult: 'failure',
        expectedError: 'Incorrect username or password',
      },
      {
        name: 'admin_user_login',
        description: 'Login as admin user',
        userData: TestUserData.getAdminUser(),
        expectedResult: 'success',
      },
      {
        name: 'inactive_user_login',
        description: 'Login with inactive user',
        userData: TestUserData.getInactiveUser(),
        expectedResult: 'failure',
        expectedError: 'Inactive user',
      },
    ];
  }

  /**
   * Get security test scenarios
   */
  static getSecurityTestScenarios(): Array<{
    name: string;
    description: string;
    userData: TestUserData;
    attackType: 'xss' | 'sql_injection' | 'csrf' | 'rate_limit';
    expectedResult: 'blocked' | 'allowed';
  }> {
    return [
      {
        name: 'xss_username_attack',
        description: 'Test XSS protection in username field',
        userData: TestUserData.getXSSUser(),
        attackType: 'xss',
        expectedResult: 'blocked',
      },
      {
        name: 'sql_injection_attack',
        description: 'Test SQL injection protection',
        userData: TestUserData.getSQLInjectionUser(),
        attackType: 'sql_injection',
        expectedResult: 'blocked',
      },
      {
        name: 'rate_limit_attack',
        description: 'Test rate limiting protection',
        userData: TestUserData.getValidUser(),
        attackType: 'rate_limit',
        expectedResult: 'blocked',
      },
    ];
  }

  /**
   * Get edge case scenarios
   */
  static getEdgeCaseScenarios(): Array<{
    name: string;
    description: string;
    userData: TestUserData;
    expectedResult: 'success' | 'failure';
  }> {
    return [
      {
        name: 'unicode_username',
        description: 'Test Unicode characters in username',
        userData: TestUserData.getUnicodeUser(),
        expectedResult: 'success',
      },
      {
        name: 'long_data_fields',
        description: 'Test very long data in fields',
        userData: TestUserData.getLongDataUser(),
        expectedResult: 'failure',
      },
      {
        name: 'special_characters',
        description: 'Test special characters in username',
        userData: TestUserData.getSpecialCharUser(),
        expectedResult: 'failure',
      },
    ];
  }
}

/**
 * Test Environment Configuration
 */
export class TestEnvironmentConfig {
  /**
   * Get development environment config
   */
  static getDevelopmentConfig(): any {
    return {
      backendUrl: 'http://localhost:8000',
      frontendUrl: 'http://localhost:3000',
      databaseUrl: 'sqlite:///test.db',
      jwtSecret: 'test-secret-key',
      jwtExpiry: 3600,
      rateLimitWindow: 900,
      rateLimitMax: 100,
    };
  }

  /**
   * Get test environment config
   */
  static getTestConfig(): any {
    return {
      backendUrl: 'http://localhost:8001',
      frontendUrl: 'http://localhost:3001',
      databaseUrl: 'sqlite:///test.db',
      jwtSecret: 'test-secret-key',
      jwtExpiry: 3600,
      rateLimitWindow: 900,
      rateLimitMax: 100,
    };
  }

  /**
   * Get production environment config
   */
  static getProductionConfig(): any {
    return {
      backendUrl: 'https://api.reynard.example.com',
      frontendUrl: 'https://reynard.example.com',
      databaseUrl: 'postgresql://user:pass@localhost/reynard',
      jwtSecret: process.env.JWT_SECRET || 'production-secret-key',
      jwtExpiry: 3600,
      rateLimitWindow: 900,
      rateLimitMax: 100,
    };
  }
}
