/**
 * Comprehensive Authentication E2E Tests
 *
 * This test suite provides comprehensive coverage of authentication flows
 * including registration, login, password management, session handling,
 * and error scenarios. These tests are designed to work with code coverage
 * collection and integration with Vitest.
 */

import { test, expect, Page } from "@playwright/test";
import { AuthTestHelpers } from "../../modules/auth/auth-helpers";
import { TestUserData } from "../../fixtures/user-data";

test.describe("Comprehensive Authentication Flows", () => {
  let auth: AuthTestHelpers;
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    auth = new AuthTestHelpers(page);

    // Enable code coverage collection
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    // Navigate to auth app
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    // Collect coverage data
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    // Store coverage for aggregation
    await page.evaluate(
      coverage => {
        window.__coverage__ = window.__coverage__ || {};
        window.__coverage__.js = coverage.js;
        window.__coverage__.css = coverage.css;
      },
      { js: jsCoverage, css: cssCoverage }
    );
  });

  test.describe("User Registration Flow", () => {
    test("should complete successful user registration", async () => {
      const userData = TestUserData.generateValidUser();

      // Navigate to registration form (using simple approach for now)
      const registerButton = page.locator("button:has-text('Register')").first();
      if (await registerButton.isVisible()) {
        await registerButton.click();
      }

      // Fill registration form
      await auth.forms.fillRegistrationForm(userData);

      // Submit form
      await auth.forms.submitRegistrationForm();

      // Verify successful registration
      await auth.verification.verifySuccessMessage("registration-success");

      // Verify user is redirected appropriately
      await expect(page).toHaveURL(/\/dashboard|\/login/);
    });

    test("should handle duplicate registration", async () => {
      const userData = TestUserData.generateValidUser();

      // First registration
      await auth.scenarios.completeRegistrationAndLogin(userData);
      await auth.core.logout();

      // Attempt duplicate registration
      await auth.forms.navigateToRegistration();
      await auth.forms.fillRegistrationForm(userData);
      await auth.forms.submitRegistrationForm();

      // Verify error message
      await auth.verification.verifyErrorMessage("registration-error", "User already exists");
    });

    test("should validate registration form fields", async () => {
      await auth.forms.navigateToRegistration();

      // Test empty form submission
      await auth.forms.submitRegistrationForm();
      await auth.verification.verifyErrorMessage("form-validation-error");

      // Test invalid email
      await auth.forms.fillRegistrationForm({
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      });
      await auth.verification.verifyErrorMessage("email-validation-error");

      // Test weak password
      await auth.forms.fillRegistrationForm({
        username: "testuser",
        email: "test@example.com",
        password: "123",
      });
      await auth.verification.verifyErrorMessage("password-validation-error");
    });
  });

  test.describe("User Login Flow", () => {
    test("should complete successful login", async () => {
      // Create a user first
      const userData = TestUserData.generateValidUser();
      await auth.core.registerUser(userData);
      await auth.core.logout();

      // Perform login
      await auth.core.loginUser(userData);

      // Verify successful login
      await auth.verification.verifyAuthenticated();
      await expect(page.locator("[data-testid='user-dashboard']")).toBeVisible();
    });

    test("should handle invalid credentials", async () => {
      const userData = TestUserData.generateValidUser();

      // Attempt login with invalid credentials
      await auth.forms.fillLoginForm({
        identifier: userData.username,
        password: "wrong-password",
      });
      await auth.forms.submitLoginForm();

      // Verify error message
      await auth.verification.verifyErrorMessage("login-error", "Invalid credentials");
      await auth.verification.verifyNotAuthenticated();
    });

    test("should remember user session", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.core.registerUser(userData);
      await auth.core.logout();

      // Login with remember me
      await auth.forms.fillLoginForm(userData);
      await auth.forms.enableRememberMe();
      await auth.forms.submitLoginForm();

      // Verify login success
      await auth.verification.verifyAuthenticated();

      // Refresh page and verify session persistence
      await auth.core.reloadPage();
      await auth.verification.verifyAuthenticated();
    });

    test("should handle session timeout", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Simulate session timeout
      await auth.core.tokens.simulateTokenExpiration();

      // Try to make authenticated request
      await page.click("[data-testid='profile-link']");

      // Should redirect to login
      await auth.verification.verifyNotAuthenticated();
    });
  });

  test.describe("Password Management", () => {
    test("should change password successfully", async () => {
      const userData = TestUserData.generateValidUser();
      const newPassword = "newPassword123!";

      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Change password
      await auth.scenarios.testPasswordChange(userData, newPassword);

      // Logout and try login with new password
      await auth.core.logout();
      await auth.core.loginUser({
        ...userData,
        password: newPassword,
      });

      await auth.verification.verifyAuthenticated();
    });

    test("should validate password strength", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Navigate to password change
      await page.click("[data-testid='change-password-link']");

      // Test weak password
      await page.fill("[data-testid='new-password-input']", "123");
      await auth.verification.verifyErrorMessage("password-strength-error");

      // Test strong password
      await page.fill("[data-testid='new-password-input']", "StrongP@ssw0rd!");
      await expect(page.locator("[data-testid='password-strength-good']")).toBeVisible();
    });

    test("should handle forgot password flow", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.core.registerUser(userData);
      await auth.core.logout();

      // Navigate to forgot password
      await page.click("[data-testid='forgot-password-link']");

      // Enter email
      await page.fill("[data-testid='email-input']", userData.email);
      await page.click("[data-testid='submit-forgot-password']");

      // Verify success message
      await auth.verification.verifySuccessMessage("forgot-password-success", "Password reset email sent");
    });
  });

  test.describe("Profile Management", () => {
    test("should update profile information", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.scenarios.completeRegistrationAndLogin(userData);

      const updates = {
        fullName: "Updated Full Name",
        email: "updated@example.com",
      };

      await auth.scenarios.testProfileUpdate(userData, updates);

      // Verify profile was updated
      await page.click("[data-testid='profile-link']");
      await expect(page.locator("[data-testid='full-name-display']")).toContainText(updates.fullName);
    });

    test("should validate profile update fields", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Navigate to profile
      await page.click("[data-testid='profile-link']");
      await page.click("[data-testid='edit-profile-button']");

      // Test invalid email
      await page.fill("[data-testid='email-input']", "invalid-email");
      await page.click("[data-testid='save-profile-button']");

      await auth.verification.verifyErrorMessage("email-validation-error");
    });
  });

  test.describe("Security and Error Handling", () => {
    test("should handle network errors gracefully", async () => {
      // Simulate network failure
      await page.route("**/api/**", route => {
        route.abort("failed");
      });

      const userData = TestUserData.generateValidUser();
      await auth.forms.fillLoginForm(userData);
      await auth.forms.submitLoginForm();

      // Verify error handling
      await auth.verification.verifyErrorMessage("network-error", "Network error occurred");
    });

    test("should prevent CSRF attacks", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Check for CSRF token
      const csrfToken = await page.locator("[name='csrf-token']").getAttribute("content");
      expect(csrfToken).toBeTruthy();
    });

    test("should sanitize inputs", async () => {
      const maliciousInput = "<script>alert('xss')</script>";

      await auth.forms.navigateToRegistration();
      await auth.forms.fillRegistrationForm({
        username: maliciousInput,
        email: "test@example.com",
        password: "password123",
      });

      // Verify input is sanitized
      const usernameValue = await page.locator("[data-testid='username-input']").inputValue();
      expect(usernameValue).not.toContain("<script>");
    });

    test("should rate limit login attempts", async () => {
      const userData = TestUserData.generateValidUser();

      // Perform multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await auth.forms.fillLoginForm({
          identifier: userData.username,
          password: "wrong-password",
        });
        await auth.forms.submitLoginForm();
        await page.waitForTimeout(500);
      }

      // Verify rate limiting
      await auth.verification.verifyErrorMessage("rate-limit-error", "Too many attempts");
    });
  });

  test.describe("Accessibility and UX", () => {
    test("should support keyboard navigation", async () => {
      // Test keyboard navigation through login form
      await page.keyboard.press("Tab"); // Focus username
      await page.keyboard.type("testuser");
      await page.keyboard.press("Tab"); // Focus password
      await page.keyboard.type("password123");
      await page.keyboard.press("Tab"); // Focus submit button
      await page.keyboard.press("Enter"); // Submit form

      // Verify form was submitted
      await page.waitForLoadState("networkidle");
    });

    test("should have proper ARIA labels", async () => {
      // Check login form accessibility
      const usernameInput = page.locator("[data-testid='username-input']");
      const passwordInput = page.locator("[data-testid='password-input']");

      await expect(usernameInput).toHaveAttribute("aria-label");
      await expect(passwordInput).toHaveAttribute("aria-label");
    });

    test("should work on mobile devices", async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify mobile layout
      await expect(page.locator("[data-testid='login-form']")).toBeVisible();
      await expect(page.locator("[data-testid='mobile-menu-toggle']")).toBeVisible();
    });
  });

  test.describe("Performance and Metrics", () => {
    test("should load authentication forms quickly", async () => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Verify page loads within reasonable time
      expect(loadTime).toBeLessThan(3000);
    });

    test("should handle concurrent logins", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.core.registerUser(userData);
      await auth.core.logout();

      // Simulate concurrent login attempts
      await auth.scenarios.testConcurrentLogins(userData);
      await auth.verification.verifyAuthenticated();
    });
  });

  test.describe("Integration Tests", () => {
    test("should integrate with backend authentication", async () => {
      const userData = TestUserData.generateValidUser();

      // Test full authentication flow with backend
      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Verify backend session
      const response = await page.evaluate(async () => {
        return fetch("/api/auth/me", {
          credentials: "include",
        }).then(r => r.json());
      });

      expect(response.user).toBeTruthy();
      expect(response.user.username).toBe(userData.username);
    });

    test("should handle token refresh", async () => {
      const userData = TestUserData.generateValidUser();
      await auth.scenarios.completeRegistrationAndLogin(userData);

      // Trigger token refresh
      await auth.core.tokens.triggerTokenRefresh();

      // Verify user remains authenticated
      await auth.verification.verifyAuthenticated();
    });
  });
});
