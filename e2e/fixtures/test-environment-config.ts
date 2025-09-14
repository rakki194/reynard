/**
 * Test Environment Configuration
 *
 * Provides environment-specific configuration for different testing scenarios
 * including development, test, and production environments.
 */

/**
 * Environment Configuration Interface
 */
export interface IEnvironmentConfig {
  backendUrl: string;
  frontendUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiry: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

/**
 * Test Environment Configuration Factory
 */
export class TestEnvironmentConfig {
  /**
   * Get development environment config
   */
  static getDevelopmentConfig(): IEnvironmentConfig {
    return {
      backendUrl: "http://localhost:8000",
      frontendUrl: "http://localhost:3000",
      databaseUrl: "sqlite:///test.db",
      jwtSecret: "test-secret-key",
      jwtExpiry: 3600,
      rateLimitWindow: 900,
      rateLimitMax: 100,
    };
  }

  /**
   * Get test environment config
   */
  static getTestConfig(): IEnvironmentConfig {
    return {
      backendUrl: "http://localhost:8001",
      frontendUrl: "http://localhost:3001",
      databaseUrl: "sqlite:///test.db",
      jwtSecret: "test-secret-key",
      jwtExpiry: 3600,
      rateLimitWindow: 900,
      rateLimitMax: 100,
    };
  }

  /**
   * Get production environment config
   */
  static getProductionConfig(): IEnvironmentConfig {
    return {
      backendUrl: "https://api.reynard.example.com",
      frontendUrl: "https://reynard.example.com",
      databaseUrl: "postgresql://user:pass@localhost/reynard",
      jwtSecret: process.env.JWT_SECRET || "production-secret-key",
      jwtExpiry: 3600,
      rateLimitWindow: 900,
      rateLimitMax: 100,
    };
  }
}
