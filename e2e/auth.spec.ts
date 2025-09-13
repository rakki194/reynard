/**
 * E2E Authentication Tests for Reynard
 * 
 * Comprehensive end-to-end tests for authentication workflows across
 * gatekeeper, backend, and auth package integration.
 */

import { test, expect } from "@playwright/test";
import { setupE2ETests, getMockBackend } from "./utils/e2e-setup";
import { AuthTestHelpers } from "./utils/auth-helpers";
import { TestUserData } from "./fixtures/test-data";

// Setup E2E test environment
setupE2ETests({
  backendPort: 8000,
  frontendPort: 3000,
  useRealBackend: false,
  testTimeout: 30000,
  debug: true,
});

test.describe("Authentication E2E Tests", () => {
  let authHelpers: AuthTestHelpers;
  let testUser: TestUserData;
  let mockBackend: any;

  test.beforeEach(async ({ page }) => {
    // Initialize test helpers
    authHelpers = new AuthTestHelpers(page);
    testUser = TestUserData.getValidUser();
    mockBackend = getMockBackend();

    // Setup mock API responses
    await mockBackend.setupAuthEndpoints();
    
    // Navigate to auth page
    await page.goto("/auth");
  });

  test.describe("User Registration", () => {
    test("should successfully register a new user", async ({ page }) => {
      // Mock successful registration response
      mockBackend.mockResponse("/api/auth/register", {
        status: 201,
        body: {
          user: {
            id: "123",
            username: testUser.username,
            email: testUser.email,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        },
      });

      // Fill registration form
      await authHelpers.fillRegistrationForm(testUser);
      
      // Submit form
      await authHelpers.submitRegistrationForm();
      
      // Verify success
      await expect(page.locator("[data-testid='registration-success']")).toBeVisible();
      await expect(page.locator("[data-testid='user-welcome']")).toContainText(testUser.username);
    });

    test("should show validation errors for invalid registration data", async ({ page }) => {
      const invalidUser = TestUserData.getInvalidUser();
      
      // Fill form with invalid data
      await authHelpers.fillRegistrationForm(invalidUser);
      await authHelpers.submitRegistrationForm();
      
      // Verify validation errors
      await expect(page.locator("[data-testid='password-error']")).toBeVisible();
      await expect(page.locator("[data-testid='email-error']")).toBeVisible();
    });

    test("should handle duplicate username registration", async ({ page }) => {
      // Mock duplicate username error
      mockBackend.mockResponse("/api/auth/register", {
        status: 400,
        body: { detail: "Username already registered" },
      });

      await authHelpers.fillRegistrationForm(testUser);
      await authHelpers.submitRegistrationForm();
      
      // Verify error message
      await expect(page.locator("[data-testid='registration-error']")).toContainText(
        "Username already registered"
      );
    });
  });

  test.describe("User Login", () => {
    test("should successfully login with valid credentials", async ({ page }) => {
      // Mock successful login response
      mockBackend.mockResponse("/api/auth/login", {
        status: 200,
        body: {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          token_type: "bearer",
        },
      });

      // Fill login form
      await authHelpers.fillLoginForm(testUser);
      
      // Submit form
      await authHelpers.submitLoginForm();
      
      // Verify successful login
      await expect(page.locator("[data-testid='user-dashboard']")).toBeVisible();
      await expect(page.locator("[data-testid='user-menu']")).toContainText(testUser.username);
    });

    test("should show error for invalid credentials", async ({ page }) => {
      // Mock authentication failure
      mockBackend.mockResponse("/api/auth/login", {
        status: 401,
        body: { detail: "Incorrect username or password" },
      });

      await authHelpers.fillLoginForm(testUser);
      await authHelpers.submitLoginForm();
      
      // Verify error message
      await expect(page.locator("[data-testid='login-error']")).toContainText(
        "Incorrect username or password"
      );
    });

    test("should handle rate limiting", async ({ page }) => {
      // Mock rate limiting response
      mockBackend.mockResponse("/api/auth/login", {
        status: 429,
        body: { detail: "Too many login attempts" },
      });

      await authHelpers.fillLoginForm(testUser);
      await authHelpers.submitLoginForm();
      
      // Verify rate limiting message
      await expect(page.locator("[data-testid='rate-limit-error']")).toBeVisible();
    });
  });

  test.describe("Token Management", () => {
    test("should automatically refresh expired tokens", async ({ page }) => {
      // Login first
      await authHelpers.loginUser(testUser);
      
      // Mock token refresh
      mockBackend.mockResponse("/api/auth/refresh", {
        status: 200,
        body: {
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          token_type: "bearer",
        },
      });

      // Simulate token expiration by making an API call
      await page.evaluate(() => {
        // Simulate expired token scenario
        localStorage.setItem('access_token', 'expired-token');
      });

      // Make API request that should trigger token refresh
      await page.click("[data-testid='protected-action']");
      
      // Verify new token is used
      await expect(page.locator("[data-testid='action-success']")).toBeVisible();
    });

    test("should logout when refresh token is invalid", async ({ page }) => {
      // Login first
      await authHelpers.loginUser(testUser);
      
      // Mock invalid refresh token
      mockBackend.mockResponse("/api/auth/refresh", {
        status: 401,
        body: { detail: "Invalid refresh token" },
      });

      // Simulate token expiration
      await page.evaluate(() => {
        localStorage.setItem('refresh_token', 'invalid-token');
      });

      // Make API request
      await page.click("[data-testid='protected-action']");
      
      // Verify user is logged out
      await expect(page.locator("[data-testid='login-form']")).toBeVisible();
    });
  });

  test.describe("Session Management", () => {
    test("should maintain session across page refreshes", async ({ page }) => {
      // Login user
      await authHelpers.loginUser(testUser);
      
      // Refresh page
      await page.reload();
      
      // Verify user is still logged in
      await expect(page.locator("[data-testid='user-dashboard']")).toBeVisible();
    });

    test("should logout user and clear session", async ({ page }) => {
      // Login user
      await authHelpers.loginUser(testUser);
      
      // Mock logout response
      mockBackend.mockResponse("/api/auth/logout", {
        status: 200,
        body: { message: "Successfully logged out" },
      });

      // Click logout
      await page.click("[data-testid='logout-button']");
      
      // Verify user is logged out
      await expect(page.locator("[data-testid='login-form']")).toBeVisible();
      
      // Verify tokens are cleared
      const tokens = await page.evaluate(() => ({
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token'),
      }));
      
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeNull();
    });
  });

  test.describe("Security Features", () => {
    test("should prevent XSS attacks in user input", async ({ page }) => {
      const maliciousUser = {
        ...testUser,
        username: "<script>alert('xss')</script>",
        email: "test@example.com<script>alert('xss')</script>",
      };

      await authHelpers.fillRegistrationForm(maliciousUser);
      await authHelpers.submitRegistrationForm();
      
      // Verify no script execution
      await expect(page.locator("script")).toHaveCount(0);
      
      // Verify input is properly escaped
      await expect(page.locator("[data-testid='username-display']")).toContainText(
        "&lt;script&gt;alert('xss')&lt;/script&gt;"
      );
    });

    test("should handle CSRF protection", async ({ page }) => {
      // Login user
      await authHelpers.loginUser(testUser);
      
      // Try to make request without CSRF token
      await page.evaluate(() => {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      });
      
      // Verify CSRF protection is working
      await expect(page.locator("[data-testid='csrf-error']")).toBeVisible();
    });

    test("should enforce password strength requirements", async ({ page }) => {
      const weakPasswordUser = {
        ...testUser,
        password: "123",
      };

      await authHelpers.fillRegistrationForm(weakPasswordUser);
      
      // Verify password strength indicator
      await expect(page.locator("[data-testid='password-strength']")).toHaveClass(/weak/);
      
      // Verify form cannot be submitted
      await expect(page.locator("[data-testid='submit-button']")).toBeDisabled();
    });
  });

  test.describe("Integration with Gatekeeper", () => {
    test("should use Gatekeeper authentication endpoints", async ({ page }) => {
      // Verify API calls go to correct endpoints
      const requests: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/auth/')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
          });
        }
      });

      await authHelpers.loginUser(testUser);
      
      // Verify requests were made to Gatekeeper endpoints
      expect(requests).toContainEqual(
        expect.objectContaining({
          url: expect.stringContaining('/auth/login'),
          method: 'POST',
        })
      );
    });

    test("should handle Gatekeeper role-based access control", async ({ page }) => {
      // Login as admin user
      const adminUser = TestUserData.getAdminUser();
      await authHelpers.loginUser(adminUser);
      
      // Verify admin features are available
      await expect(page.locator("[data-testid='admin-panel']")).toBeVisible();
      
      // Login as regular user
      await authHelpers.logout();
      await authHelpers.loginUser(testUser);
      
      // Verify admin features are hidden
      await expect(page.locator("[data-testid='admin-panel']")).not.toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Mock network error
      mockBackend.mockNetworkError("/api/auth/login");
      
      await authHelpers.fillLoginForm(testUser);
      await authHelpers.submitLoginForm();
      
      // Verify error handling
      await expect(page.locator("[data-testid='network-error']")).toBeVisible();
    });

    test("should handle server errors gracefully", async ({ page }) => {
      // Mock server error
      mockBackend.mockResponse("/api/auth/login", {
        status: 500,
        body: { detail: "Internal server error" },
      });

      await authHelpers.fillLoginForm(testUser);
      await authHelpers.submitLoginForm();
      
      // Verify error handling
      await expect(page.locator("[data-testid='server-error']")).toBeVisible();
    });

    test("should handle malformed API responses", async ({ page }) => {
      // Mock malformed response
      mockBackend.mockResponse("/api/auth/login", {
        status: 200,
        body: "invalid json",
      });

      await authHelpers.fillLoginForm(testUser);
      await authHelpers.submitLoginForm();
      
      // Verify error handling
      await expect(page.locator("[data-testid='parse-error']")).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("should complete login within acceptable time", async () => {
      const startTime = Date.now();
      
      await authHelpers.loginUser(testUser);
      
      const endTime = Date.now();
      const loginTime = endTime - startTime;
      
      // Verify login completes within 2 seconds
      expect(loginTime).toBeLessThan(2000);
    });

    test("should handle concurrent login attempts", async ({ page }) => {
      // Simulate multiple concurrent login attempts
      const promises = Array.from({ length: 5 }, () => 
        authHelpers.loginUser(testUser)
      );
      
      // All should complete successfully
      await Promise.all(promises);
      
      // Verify user is logged in
      await expect(page.locator("[data-testid='user-dashboard']")).toBeVisible();
    });
  });
});
