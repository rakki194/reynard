/**
 * Authentication Utility Helpers for E2E Testing
 *
 * Provides utility functions for debugging, screenshots, and test environment
 * setup for authentication testing.
 */

import { Page } from "@playwright/test";

/**
 * Authentication Utility Helpers Class
 */
export class AuthUtilityHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Reload the current page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Execute JavaScript in page context
   */
  async executeScript<T>(script: string): Promise<T> {
    return await this.page.evaluate(script);
  }


  /**
   * Clear browser storage
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies if needed
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    });
  }

  /**
   * Setup authentication test environment
   */
  async setupTestEnvironment(): Promise<void> {
    await this.clearStorage();
    await this.waitForNetworkIdle();
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment(): Promise<void> {
    await this.clearStorage();
    await this.takeScreenshot("test-cleanup");
  }
}

/**
 * Setup authentication test environment
 */
export async function setupAuthTestEnvironment(_config: any): Promise<any> {
  return {
    clearAuthState: async () => {
      // Clear authentication state
    },
    getAuthState: () => {
      // Get current authentication state
      return "unauthenticated";
    },
    cleanup: async () => {
      // Cleanup test environment
    },
  };
}
