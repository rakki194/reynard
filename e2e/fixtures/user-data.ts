/**
 * Test User Data Interface and Factory
 *
 * Provides core test user data for authentication scenarios.
 * For security and edge case test users, see the specialized modules.
 */

import { SecurityTestUsers } from "./security-test-users";
import { EdgeCaseTestUsers } from "./edge-case-test-users";

/**
 * Test User Data Interface
 */
export interface ITestUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: "user" | "admin" | "moderator";
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
  static getValidUser(): ITestUserData {
    return {
      username: "testuser",
      email: "test@example.com",
      password: "SecurePassword123!",
      fullName: "Test User",
      role: "user",
      permissions: ["read"],
      isActive: true,
    };
  }

  /**
   * Get an admin test user
   */
  static getAdminUser(): ITestUserData {
    return {
      username: "admin",
      email: "admin@example.com",
      password: "AdminPassword123!",
      fullName: "Admin User",
      role: "admin",
      permissions: ["read", "write", "delete", "admin"],
      isActive: true,
    };
  }

  /**
   * Get a moderator test user
   */
  static getModeratorUser(): ITestUserData {
    return {
      username: "moderator",
      email: "moderator@example.com",
      password: "ModeratorPassword123!",
      fullName: "Moderator User",
      role: "moderator",
      permissions: ["read", "write", "moderate"],
      isActive: true,
    };
  }

  // Security test users - delegated to SecurityTestUsers
  static getInvalidUser = EdgeCaseTestUsers.getInvalidUser;
  static getWeakPasswordUser = SecurityTestUsers.getWeakPasswordUser;
  static getSpecialCharUser = EdgeCaseTestUsers.getSpecialCharUser;
  static getLongDataUser = EdgeCaseTestUsers.getLongDataUser;
  static getXSSUser = SecurityTestUsers.getXSSUser;
  static getSQLInjectionUser = SecurityTestUsers.getSQLInjectionUser;
  static getUnicodeUser = EdgeCaseTestUsers.getUnicodeUser;
  static getInactiveUser = EdgeCaseTestUsers.getInactiveUser;

  /**
   * Get multiple test users
   */
  static getMultipleUsers(count: number = 5): ITestUserData[] {
    return Array.from({ length: count }, (_, index) => ({
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      password: "SecurePassword123!",
      fullName: `User ${index + 1}`,
      role: "user" as const,
      permissions: ["read"],
      isActive: true,
    }));
  }
}
