/**
 * Test Scenarios Data
 *
 * Provides comprehensive test scenarios for authentication flows,
 * security testing, and edge case validation.
 */

import type { ITestUserData } from "./user-data";
import { TestUserData } from "./user-data";

/**
 * Authentication Flow Scenario Interface
 */
export interface IAuthFlowScenario {
  name: string;
  description: string;
  userData: ITestUserData;
  expectedResult: "success" | "failure";
  expectedError?: string;
}

/**
 * Security Test Scenario Interface
 */
export interface ISecurityTestScenario {
  name: string;
  description: string;
  userData: ITestUserData;
  attackType: "xss" | "sql_injection" | "csrf" | "rate_limit";
  expectedResult: "blocked" | "allowed";
}

/**
 * Edge Case Scenario Interface
 */
export interface IEdgeCaseScenario {
  name: string;
  description: string;
  userData: ITestUserData;
  expectedResult: "success" | "failure";
}

/**
 * Test Scenarios Factory
 */
export class TestScenarios {
  /**
   * Get authentication flow scenarios
   */
  static getAuthFlowScenarios(): IAuthFlowScenario[] {
    return [
      {
        name: "valid_user_registration",
        description: "Register a new user with valid data",
        userData: TestUserData.getValidUser(),
        expectedResult: "success",
      },
      {
        name: "invalid_user_registration",
        description: "Register a user with invalid data",
        userData: TestUserData.getInvalidUser(),
        expectedResult: "failure",
        expectedError: "Validation error",
      },
      {
        name: "valid_user_login",
        description: "Login with valid credentials",
        userData: TestUserData.getValidUser(),
        expectedResult: "success",
      },
      {
        name: "invalid_user_login",
        description: "Login with invalid credentials",
        userData: { ...TestUserData.getValidUser(), password: "wrongpassword" },
        expectedResult: "failure",
        expectedError: "Incorrect username or password",
      },
      {
        name: "admin_user_login",
        description: "Login as admin user",
        userData: TestUserData.getAdminUser(),
        expectedResult: "success",
      },
      {
        name: "inactive_user_login",
        description: "Login with inactive user",
        userData: TestUserData.getInactiveUser(),
        expectedResult: "failure",
        expectedError: "Inactive user",
      },
    ];
  }

  /**
   * Get security test scenarios
   */
  static getSecurityTestScenarios(): ISecurityTestScenario[] {
    return [
      {
        name: "xss_username_attack",
        description: "Test XSS protection in username field",
        userData: TestUserData.getXSSUser(),
        attackType: "xss",
        expectedResult: "blocked",
      },
      {
        name: "sql_injection_attack",
        description: "Test SQL injection protection",
        userData: TestUserData.getSQLInjectionUser(),
        attackType: "sql_injection",
        expectedResult: "blocked",
      },
      {
        name: "rate_limit_attack",
        description: "Test rate limiting protection",
        userData: TestUserData.getValidUser(),
        attackType: "rate_limit",
        expectedResult: "blocked",
      },
    ];
  }

  /**
   * Get edge case scenarios
   */
  static getEdgeCaseScenarios(): IEdgeCaseScenario[] {
    return [
      {
        name: "unicode_username",
        description: "Test Unicode characters in username",
        userData: TestUserData.getUnicodeUser(),
        expectedResult: "success",
      },
      {
        name: "long_data_fields",
        description: "Test very long data in fields",
        userData: TestUserData.getLongDataUser(),
        expectedResult: "failure",
      },
      {
        name: "special_characters",
        description: "Test special characters in username",
        userData: TestUserData.getSpecialCharUser(),
        expectedResult: "failure",
      },
    ];
  }
}
