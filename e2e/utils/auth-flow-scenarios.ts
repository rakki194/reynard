/**
 * Authentication Flow Scenarios for E2E Testing
 *
 * Provides comprehensive test scenarios for authentication workflows
 * including registration, login, password changes, and session management.
 */

import { ITestUserData } from "../fixtures/user-data";
import { AuthCoreOperations } from "./auth-core-operations";
import { AuthFormHandlers } from "./auth-form-handlers";
import { AuthVerificationHelpers } from "./auth-verification-helpers";

/**
 * Authentication Flow Scenarios Class
 */
export class AuthFlowScenarios {
  private coreOps: AuthCoreOperations;
  private formHandlers: AuthFormHandlers;
  private verification: AuthVerificationHelpers;

  constructor(
    coreOps: AuthCoreOperations,
    formHandlers: AuthFormHandlers,
    verification: AuthVerificationHelpers,
  ) {
    this.coreOps = coreOps;
    this.formHandlers = formHandlers;
    this.verification = verification;
  }

  /**
   * Complete registration and login flow
   */
  async completeRegistrationAndLogin(userData: ITestUserData): Promise<void> {
    await this.coreOps.registerUser(userData);
    await this.coreOps.logout();
    await this.coreOps.loginUser(userData);
  }

  /**
   * Test password change flow
   */
  async testPasswordChange(
    userData: ITestUserData,
    newPassword: string,
  ): Promise<void> {
    await this.coreOps.loginUser(userData);
    await this.formHandlers.changePassword(userData.password, newPassword);
    await this.verification.verifySuccessMessage("password-change-success");
  }

  /**
   * Test profile update flow
   */
  async testProfileUpdate(
    userData: ITestUserData,
    updates: Partial<ITestUserData>,
  ): Promise<void> {
    await this.coreOps.loginUser(userData);
    await this.formHandlers.updateProfile(updates);
    await this.verification.verifySuccessMessage("profile-update-success");
  }

  /**
   * Test session persistence
   */
  async testSessionPersistence(userData: ITestUserData): Promise<void> {
    await this.coreOps.loginUser(userData);

    // Refresh page
    await this.coreOps.page.reload();
    await this.verification.waitForNetworkIdle();

    // Verify user is still logged in
    await this.verification.verifyAuthenticated();
  }

  /**
   * Test concurrent login attempts
   */
  async testConcurrentLogins(userData: ITestUserData): Promise<void> {
    const promises = Array.from({ length: 3 }, () =>
      this.coreOps.loginUser(userData),
    );

    await Promise.all(promises);
    await this.verification.verifyAuthenticated();
  }

  /**
   * Test token expiration handling
   */
  async testTokenExpiration(userData: ITestUserData): Promise<void> {
    await this.coreOps.loginUser(userData);
    await this.coreOps.tokens.simulateTokenExpiration();
    
    // Attempt to make authenticated request
    const response = await this.coreOps.tokens.makeAuthenticatedRequest("/api/user");
    
    // Should redirect to login or return 401
    if (response.status === 401) {
      await this.verification.verifyNotAuthenticated();
    }
  }

  /**
   * Test invalid login attempts
   */
  async testInvalidLogin(userData: ITestUserData): Promise<void> {
    const invalidData = { ...userData, password: "wrong-password" };
    
    try {
      await this.coreOps.loginUser(invalidData);
    } catch (error) {
      // Expected to fail
    }
    
    await this.verification.verifyNotAuthenticated();
    await this.verification.verifyErrorMessage("login-error");
  }

  /**
   * Test registration with existing user
   */
  async testDuplicateRegistration(userData: ITestUserData): Promise<void> {
    // First registration should succeed
    await this.coreOps.registerUser(userData);
    await this.coreOps.logout();
    
    // Second registration should fail
    try {
      await this.coreOps.registerUser(userData);
    } catch (error) {
      // Expected to fail
    }
    
    await this.verification.verifyErrorMessage("registration-error");
  }
}
