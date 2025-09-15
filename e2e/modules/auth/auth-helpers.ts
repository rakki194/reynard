/**
 * Authentication Test Helpers for E2E Testing
 *
 * Provides comprehensive helper functions for testing authentication workflows
 * across the Reynard ecosystem. This is the main barrel export that combines
 * all authentication testing modules.
 */

import { Page } from "@playwright/test";
import { ITestUserData } from "../fixtures/user-data";

// Import all authentication modules
import { AuthCoreOperations } from "./auth-core-operations";
import { AuthFormHandlers } from "./auth-form-handlers";
import { AuthVerificationHelpers } from "./auth-verification-helpers";
import { AuthFlowScenarios } from "./auth-flow-scenarios";
import { AuthUtilityHelpers } from "./auth-utility-helpers";
import { AuthFormUtilities } from "./auth-form-utilities";
import { AuthElementVerification } from "./auth-element-verification";

// Re-export all modules for external use
export { AuthCoreOperations } from "./auth-core-operations";
export { AuthFormHandlers } from "./auth-form-handlers";
export { AuthVerificationHelpers } from "./auth-verification-helpers";
export { AuthFlowScenarios } from "./auth-flow-scenarios";
export { AuthUtilityHelpers } from "./auth-utility-helpers";
export { AuthTokenManager } from "./auth-token-manager";
export { AuthFormUtilities } from "./auth-form-utilities";
export { AuthElementVerification } from "./auth-element-verification";
export { setupAuthTestEnvironment } from "./auth-utility-helpers";

/**
 * Main Authentication Test Helpers Class
 * 
 * This class combines all authentication testing functionality into a single
 * convenient interface while maintaining the modular architecture underneath.
 */
export class AuthTestHelpers {
  public readonly core: AuthCoreOperations;
  public readonly forms: AuthFormHandlers;
  public readonly verification: AuthVerificationHelpers;
  public readonly scenarios: AuthFlowScenarios;
  public readonly utilities: AuthUtilityHelpers;
  public readonly formUtils: AuthFormUtilities;
  public readonly elementVerification: AuthElementVerification;

  constructor(page: Page) {
    this.core = new AuthCoreOperations(page);
    this.forms = new AuthFormHandlers(page);
    this.verification = new AuthVerificationHelpers(page);
    this.utilities = new AuthUtilityHelpers(page);
    this.formUtils = new AuthFormUtilities(page);
    this.elementVerification = new AuthElementVerification(page);
    
    // Initialize scenarios with dependencies
    this.scenarios = new AuthFlowScenarios(
      this.core,
      this.forms,
      this.verification,
    );
  }

  // Convenience methods that delegate to appropriate modules
  async loginUser(userData: ITestUserData): Promise<void> {
    return this.core.loginUser(userData);
  }

  async registerUser(userData: ITestUserData): Promise<void> {
    return this.core.registerUser(userData);
  }

  async logout(): Promise<void> {
    return this.core.logout();
  }

  async verifyAuthenticated(): Promise<void> {
    return this.verification.verifyAuthenticated();
  }

  async verifyNotAuthenticated(): Promise<void> {
    return this.verification.verifyNotAuthenticated();
  }

  async takeScreenshot(name: string): Promise<void> {
    return this.utilities.takeScreenshot(name);
  }

  async clearAuthState(): Promise<void> {
    return this.core.clearAuthState();
  }
}
