/**
 * Edge Case Test User Data
 *
 * Provides test user data for edge cases and boundary testing scenarios
 * including special characters, long data, Unicode, and validation edge cases.
 */

import type { ITestUserData } from "./user-data";

/**
 * Edge Case Test User Factory
 */
export class EdgeCaseTestUsers {
  /**
   * Get a user with special characters in username
   */
  static getSpecialCharUser(): ITestUserData {
    return {
      username: "user@#$%",
      email: "special@example.com",
      password: "SecurePassword123!",
      fullName: "Special User",
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }

  /**
   * Get a user with very long data
   */
  static getLongDataUser(): ITestUserData {
    const longString = "a".repeat(1000);
    return {
      username: longString,
      email: `${longString}@example.com`,
      password: "SecurePassword123!",
      fullName: longString,
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }

  /**
   * Get a user with Unicode characters
   */
  static getUnicodeUser(): ITestUserData {
    return {
      username: "用户测试",
      email: "unicode@example.com",
      password: "SecurePassword123!",
      fullName: "测试用户 🦊",
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }

  /**
   * Get an inactive user
   */
  static getInactiveUser(): ITestUserData {
    return {
      username: "inactive",
      email: "inactive@example.com",
      password: "SecurePassword123!",
      fullName: "Inactive User",
      role: "user",
      permissions: ["read"],
      isActive: false,
    };
  }

  /**
   * Get an invalid test user (for validation testing)
   */
  static getInvalidUser(): ITestUserData {
    return {
      username: "a", // Too short
      email: "invalid-email", // Invalid email format
      password: "123", // Too weak
      fullName: "",
      role: "user",
      permissions: [],
      isActive: true,
    };
  }
}
