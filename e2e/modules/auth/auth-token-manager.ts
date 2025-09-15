/**
 * Authentication Token Manager for E2E Testing
 *
 * Handles token management operations including storage, retrieval,
 * expiration simulation, and authenticated API requests.
 */

import { Page } from "@playwright/test";

/**
 * Authentication Token Manager Class
 */
export class AuthTokenManager {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get authentication tokens from storage
   */
  async getAuthTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    return await this.page.evaluate(() => ({
      accessToken: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token"),
    }));
  }

  /**
   * Set authentication tokens in storage
   */
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.page.evaluate(
      ({ accessToken, refreshToken }) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
      },
      { accessToken, refreshToken }
    );
  }

  /**
   * Simulate token expiration
   */
  async simulateTokenExpiration(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.setItem("access_token", "expired-token");
    });
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  }> {
    return await this.page.evaluate(
      async ({ endpoint, options }) => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(endpoint, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text(),
        };
      },
      { endpoint, options }
    );
  }

  /**
   * Clear authentication state (localStorage, sessionStorage)
   */
  async clearAuthState(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Check if user has valid tokens
   */
  async hasValidTokens(): Promise<boolean> {
    const tokens = await this.getAuthTokens();
    return !!(tokens.accessToken && tokens.refreshToken);
  }

  /**
   * Remove specific token from storage
   */
  async removeToken(tokenName: string): Promise<void> {
    await this.page.evaluate(name => {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    }, tokenName);
  }
}
