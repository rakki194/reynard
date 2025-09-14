/**
 * Security Test User Data
 *
 * Provides test user data specifically for security testing scenarios
 * including XSS, SQL injection, and other attack vectors.
 */

import type { ITestUserData } from "./user-data";

/**
 * Security Test User Factory
 */
export class SecurityTestUsers {
  /**
   * Get a user with XSS attempt
   */
  static getXSSUser(): ITestUserData {
    return {
      username: '<script>alert("xss")</script>',
      email: 'xss@example.com<script>alert("xss")</script>',
      password: "SecurePassword123!",
      fullName: '<img src=x onerror=alert("xss")>',
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }

  /**
   * Get a user with SQL injection attempt
   */
  static getSQLInjectionUser(): ITestUserData {
    return {
      username: "admin'; DROP TABLE users; --",
      email: "sql@example.com'; DROP TABLE users; --",
      password: "SecurePassword123!",
      fullName: "'; DROP TABLE users; --",
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }

  /**
   * Get a user with weak password
   */
  static getWeakPasswordUser(): ITestUserData {
    return {
      username: "weakuser",
      email: "weak@example.com",
      password: "123456",
      fullName: "Weak User",
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }
}
