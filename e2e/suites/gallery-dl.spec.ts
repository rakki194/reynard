import { expect, test } from "@playwright/test";

test.describe("Gallery-dl Integration", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the gallery-dl page
    await page.goto("/gallery-dl");

    // Wait for the page to load
    await page.waitForSelector('[data-testid="gallery-download-manager"]');
  });

  test("should display gallery download manager interface", async ({ page }) => {
    // Check that the main interface elements are present
    await expect(page.locator('[data-testid="gallery-download-manager"]')).toBeVisible();
    await expect(page.locator('[data-testid="url-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-section"]')).toBeVisible();
  });

  test("should validate URL and show extractor information", async ({ page }) => {
    // Enter a valid URL
    await page.fill('[data-testid="url-input"]', "https://example.com/gallery");

    // Click validate button
    await page.click('[data-testid="validate-button"]');

    // Wait for validation result
    await page.waitForSelector('[data-testid="validation-result"]');

    // Check that validation result is shown
    await expect(page.locator('[data-testid="validation-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="extractor-info"]')).toBeVisible();
  });

  test("should handle invalid URL validation", async ({ page }) => {
    // Enter an invalid URL
    await page.fill('[data-testid="url-input"]', "invalid-url");

    // Click validate button
    await page.click('[data-testid="validate-button"]');

    // Wait for validation result
    await page.waitForSelector('[data-testid="validation-result"]');

    // Check that error is shown
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText("No extractor found");
  });

  test("should start download and show progress", async ({ page }) => {
    // Mock the download API response
    await page.route("**/api/gallery/download", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          download_id: "test-download-123",
          url: "https://example.com/gallery",
          extractor: "test-extractor",
          files: [],
          total_files: 5,
          downloaded_files: 0,
          total_bytes: 10240000,
          downloaded_bytes: 0,
          status: "downloading",
          created_at: "2025-01-15T10:00:00Z",
          completed_at: null,
          error: null,
        }),
      });
    });

    // Enter a valid URL
    await page.fill('[data-testid="url-input"]', "https://example.com/gallery");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for download to start
    await page.waitForSelector('[data-testid="download-progress"]');

    // Check that progress is shown
    await expect(page.locator('[data-testid="download-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-status"]')).toBeVisible();
  });

  test("should show download progress updates", async ({ page }) => {
    // Mock the download API response
    await page.route("**/api/gallery/download", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          download_id: "test-download-123",
          url: "https://example.com/gallery",
          extractor: "test-extractor",
          files: [],
          total_files: 5,
          downloaded_files: 0,
          total_bytes: 10240000,
          downloaded_bytes: 0,
          status: "downloading",
          created_at: "2025-01-15T10:00:00Z",
          completed_at: null,
          error: null,
        }),
      });
    });

    // Mock WebSocket progress updates
    await page.route("**/api/gallery/ws", async route => {
      // Simulate WebSocket connection
      await route.fulfill({
        status: 101,
        headers: { Upgrade: "websocket" },
      });
    });

    // Enter a valid URL
    await page.fill('[data-testid="url-input"]', "https://example.com/gallery");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for download to start
    await page.waitForSelector('[data-testid="download-progress"]');

    // Check that progress elements are present
    await expect(page.locator('[data-testid="progress-percentage"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-file"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-speed"]')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-time"]')).toBeVisible();
  });

  test("should handle download errors gracefully", async ({ page }) => {
    // Mock the download API error response
    await page.route("**/api/gallery/download", async route => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Invalid URL provided",
          download_id: null,
          url: "invalid-url",
          extractor: null,
          files: [],
          total_files: 0,
          downloaded_files: 0,
          total_bytes: 0,
          downloaded_bytes: 0,
          status: "failed",
          created_at: "2025-01-15T10:00:00Z",
          completed_at: null,
        }),
      });
    });

    // Enter an invalid URL
    await page.fill('[data-testid="url-input"]', "invalid-url");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for error to be displayed
    await page.waitForSelector('[data-testid="download-error"]');

    // Check that error is shown
    await expect(page.locator('[data-testid="download-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-error"]')).toContainText("Invalid URL provided");
  });

  test("should display download history", async ({ page }) => {
    // Mock the history API response
    await page.route("**/api/gallery/history", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            download_id: "download-1",
            url: "https://example.com/gallery1",
            status: "completed",
            created_at: "2025-01-15T10:00:00Z",
            completed_at: "2025-01-15T10:05:00Z",
            total_files: 5,
            downloaded_files: 5,
          },
          {
            download_id: "download-2",
            url: "https://example.com/gallery2",
            status: "failed",
            created_at: "2025-01-15T11:00:00Z",
            completed_at: null,
            total_files: 3,
            downloaded_files: 1,
          },
        ]),
      });
    });

    // Wait for history to load
    await page.waitForSelector('[data-testid="download-history"]');

    // Check that history is displayed
    await expect(page.locator('[data-testid="download-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(2);

    // Check first history item
    await expect(page.locator('[data-testid="history-item"]').first()).toContainText("https://example.com/gallery1");
    await expect(page.locator('[data-testid="history-item"]').first()).toContainText("completed");

    // Check second history item
    await expect(page.locator('[data-testid="history-item"]').last()).toContainText("https://example.com/gallery2");
    await expect(page.locator('[data-testid="history-item"]').last()).toContainText("failed");
  });

  test("should allow cancelling active downloads", async ({ page }) => {
    // Mock the download API response
    await page.route("**/api/gallery/download", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          download_id: "test-download-123",
          url: "https://example.com/gallery",
          extractor: "test-extractor",
          files: [],
          total_files: 5,
          downloaded_files: 0,
          total_bytes: 10240000,
          downloaded_bytes: 0,
          status: "downloading",
          created_at: "2025-01-15T10:00:00Z",
          completed_at: null,
          error: null,
        }),
      });
    });

    // Mock the cancel API response
    await page.route("**/api/gallery/download/test-download-123/cancel", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Download cancelled successfully",
        }),
      });
    });

    // Enter a valid URL
    await page.fill('[data-testid="url-input"]', "https://example.com/gallery");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for download to start
    await page.waitForSelector('[data-testid="download-progress"]');

    // Click cancel button
    await page.click('[data-testid="cancel-download-button"]');

    // Wait for cancellation confirmation
    await page.waitForSelector('[data-testid="download-cancelled"]');

    // Check that cancellation is confirmed
    await expect(page.locator('[data-testid="download-cancelled"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-cancelled"]')).toContainText("cancelled");
  });

  test("should show configuration options", async ({ page }) => {
    // Click on configuration panel
    await page.click('[data-testid="config-toggle"]');

    // Wait for configuration panel to open
    await page.waitForSelector('[data-testid="configuration-panel"]');

    // Check that configuration options are present
    await expect(page.locator('[data-testid="output-directory"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-concurrent"]')).toBeVisible();
    await expect(page.locator('[data-testid="extractor-options"]')).toBeVisible();
  });

  test("should handle batch downloads", async ({ page }) => {
    // Navigate to batch download section
    await page.click('[data-testid="batch-downloads-tab"]');

    // Wait for batch download interface
    await page.waitForSelector('[data-testid="batch-download-manager"]');

    // Check that batch interface is present
    await expect(page.locator('[data-testid="batch-urls-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-priority-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-batch-button"]')).toBeVisible();
  });

  test("should create batch download", async ({ page }) => {
    // Mock the batch API response
    await page.route("**/api/gallery/batch", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          batch_id: "batch-123",
          name: "Test Batch",
          total_items: 3,
          completed_items: 0,
          failed_items: 0,
          status: "pending",
          created_at: "2025-01-15T10:00:00Z",
        }),
      });
    });

    // Navigate to batch download section
    await page.click('[data-testid="batch-downloads-tab"]');

    // Wait for batch download interface
    await page.waitForSelector('[data-testid="batch-download-manager"]');

    // Fill in batch details
    await page.fill('[data-testid="batch-name-input"]', "Test Batch");
    await page.fill(
      '[data-testid="batch-urls-input"]',
      "https://example.com/gallery1\nhttps://example.com/gallery2\nhttps://example.com/gallery3"
    );
    await page.selectOption('[data-testid="batch-priority-select"]', "normal");

    // Click create batch button
    await page.click('[data-testid="create-batch-button"]');

    // Wait for batch to be created
    await page.waitForSelector('[data-testid="batch-created"]');

    // Check that batch is created
    await expect(page.locator('[data-testid="batch-created"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-created"]')).toContainText("Test Batch");
  });

  test("should show WebSocket connection status", async ({ page }) => {
    // Check that WebSocket status is displayed
    await expect(page.locator('[data-testid="websocket-status"]')).toBeVisible();

    // Check that connection indicator is present
    await expect(page.locator('[data-testid="connection-indicator"]')).toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Mock network error
    await page.route("**/api/gallery/**", async route => {
      await route.abort("failed");
    });

    // Enter a valid URL
    await page.fill('[data-testid="url-input"]', "https://example.com/gallery");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for error to be displayed
    await page.waitForSelector('[data-testid="network-error"]');

    // Check that network error is shown
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText("Network error");
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that interface is still usable on mobile
    await expect(page.locator('[data-testid="gallery-download-manager"]')).toBeVisible();
    await expect(page.locator('[data-testid="url-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible();

    // Check that mobile-specific elements are present
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test("should handle large file downloads", async ({ page }) => {
    // Mock large file download
    await page.route("**/api/gallery/download", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          download_id: "large-download-123",
          url: "https://example.com/large-gallery",
          extractor: "large-extractor",
          files: [],
          total_files: 1000,
          downloaded_files: 0,
          total_bytes: 1073741824, // 1 GB
          downloaded_bytes: 0,
          status: "downloading",
          created_at: "2025-01-15T10:00:00Z",
          completed_at: null,
          error: null,
        }),
      });
    });

    // Enter URL for large gallery
    await page.fill('[data-testid="url-input"]', "https://example.com/large-gallery");

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for download to start
    await page.waitForSelector('[data-testid="download-progress"]');

    // Check that large file information is displayed correctly
    await expect(page.locator('[data-testid="total-files"]')).toContainText("1000");
    await expect(page.locator('[data-testid="total-size"]')).toContainText("1.0 GB");
  });

  test("should handle authentication-required URLs", async ({ page }) => {
    // Mock validation for auth-required URL
    await page.route("**/api/gallery/validate", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          valid: true,
          url: "https://private.example.com/gallery",
          extractor: "private-extractor",
          extractor_info: {
            name: "private-extractor",
            category: "private",
            subcategory: "gallery",
            pattern: "private\\.example\\.com/gallery",
            description: "Private gallery extractor",
          },
          estimated_files: 10,
          estimated_size: 20480000,
          requires_auth: true,
          error: null,
        }),
      });
    });

    // Enter private URL
    await page.fill('[data-testid="url-input"]', "https://private.example.com/gallery");

    // Click validate button
    await page.click('[data-testid="validate-button"]');

    // Wait for validation result
    await page.waitForSelector('[data-testid="validation-result"]');

    // Check that auth requirement is shown
    await expect(page.locator('[data-testid="auth-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-required"]')).toContainText("Authentication required");
  });
});
