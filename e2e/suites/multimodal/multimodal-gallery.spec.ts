/**
 * E2E Tests for MultiModal Gallery Component
 *
 * Tests the MultiModalGallery component in a real browser environment
 * to verify functionality, interactions, and user experience.
 */

import { test, expect } from "@playwright/test";

test.describe("MultiModal Gallery E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page that includes the MultiModalGallery component
    // This would typically be an example page or demo page
    await page.goto("/examples/multimodal-demo");
  });

  test("should render MultiModalGallery with initial files", async ({ page }) => {
    // Wait for the gallery to be visible
    await expect(page.locator('[data-testid="multimodal-gallery"]')).toBeVisible();

    // Check that the gallery header is present
    await expect(page.locator('[data-testid="gallery-header"]')).toBeVisible();

    // Check that the gallery content area is present
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();
  });

  test("should display file counts correctly", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Check that file count indicators are present
    await expect(page.locator('[data-testid="file-counts"]')).toBeVisible();

    // Verify that counts are displayed for different file types
    await expect(page.locator('[data-testid="image-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="audio-count"]')).toBeVisible();
  });

  test("should switch between view modes", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Test grid view
    await page.click('[data-testid="view-toggle-grid"]');
    await expect(page.locator('[data-testid="gallery-grid"]')).toBeVisible();

    // Test list view
    await page.click('[data-testid="view-toggle-list"]');
    await expect(page.locator('[data-testid="gallery-list"]')).toBeVisible();

    // Test timeline view
    await page.click('[data-testid="view-toggle-timeline"]');
    await expect(page.locator('[data-testid="gallery-timeline"]')).toBeVisible();
  });

  test("should filter files by type", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Test image filter
    await page.click('[data-testid="filter-images"]');
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();

    // Test video filter
    await page.click('[data-testid="filter-videos"]');
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();

    // Test all files filter
    await page.click('[data-testid="filter-all"]');
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();
  });

  test("should handle file upload", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Create a test file
    const fileInput = page.locator('[data-testid="file-upload-input"]');

    // Upload a test image file
    await fileInput.setInputFiles({
      name: "test-image.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-data"),
    });

    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]', { timeout: 5000 });

    // Verify the file appears in the gallery
    await expect(page.locator('[data-testid="file-card-test-image.jpg"]')).toBeVisible();
  });

  test("should handle file selection and detail view", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Click on a file card
    await page.click('[data-testid="file-card-0"]');

    // Verify detail view opens
    await expect(page.locator('[data-testid="file-detail-modal"]')).toBeVisible();

    // Verify file information is displayed
    await expect(page.locator('[data-testid="file-detail-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-detail-size"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-detail-type"]')).toBeVisible();

    // Close the detail view
    await page.click('[data-testid="close-detail"]');

    // Verify detail view closes
    await expect(page.locator('[data-testid="file-detail-modal"]')).not.toBeVisible();
  });

  test("should handle file removal", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Get initial file count
    const initialCount = await page.locator('[data-testid="file-card"]').count();

    // Click remove button on first file
    await page.click('[data-testid="file-remove-0"]');

    // Confirm removal in dialog
    await page.click('[data-testid="confirm-remove"]');

    // Verify file count decreased
    await expect(page.locator('[data-testid="file-card"]')).toHaveCount(initialCount - 1);
  });

  test("should respect max files limit", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Try to upload more files than the limit allows
    const fileInput = page.locator('[data-testid="file-upload-input"]');

    // Upload multiple files
    await fileInput.setInputFiles([
      {
        name: "test1.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data-1"),
      },
      {
        name: "test2.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data-2"),
      },
      {
        name: "test3.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data-3"),
      },
    ]);

    // Verify that only the allowed number of files are accepted
    // This would depend on the maxFiles configuration
    await expect(page.locator('[data-testid="file-card"]')).toHaveCount({ max: 10 });
  });

  test("should show loading states during file processing", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Upload a file
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: "large-test-image.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-large-image-data"),
    });

    // Verify loading indicator appears
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();

    // Wait for loading to complete
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible({ timeout: 10000 });
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Try to upload an invalid file
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: "invalid-file.exe",
      mimeType: "application/x-executable",
      buffer: Buffer.from("fake-executable-data"),
    });

    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Verify error message contains appropriate text
    await expect(page.locator('[data-testid="error-message"]')).toContainText("unsupported file type");
  });

  test("should be accessible with keyboard navigation", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="view-toggle-grid"]')).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="view-toggle-list"]')).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="filter-all"]')).toBeFocused();

    // Test Enter key activation
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-testid="gallery-list"]')).toBeVisible();
  });

  test("should have proper ARIA labels and roles", async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Check ARIA labels
    await expect(page.locator('[data-testid="multimodal-gallery"]')).toHaveAttribute("role", "region");
    await expect(page.locator('[data-testid="multimodal-gallery"]')).toHaveAttribute(
      "aria-label",
      "Multi-modal file gallery"
    );

    // Check button labels
    await expect(page.locator('[data-testid="view-toggle-grid"]')).toHaveAttribute("aria-label", "Switch to grid view");
    await expect(page.locator('[data-testid="view-toggle-list"]')).toHaveAttribute("aria-label", "Switch to list view");

    // Check file cards have proper roles
    await expect(page.locator('[data-testid="file-card-0"]')).toHaveAttribute("role", "button");
    await expect(page.locator('[data-testid="file-card-0"]')).toHaveAttribute("aria-label");
  });

  test("should handle responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Verify gallery adapts to mobile layout
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Verify gallery adapts to tablet layout
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForSelector('[data-testid="multimodal-gallery"]');

    // Verify gallery adapts to desktop layout
    await expect(page.locator('[data-testid="gallery-content"]')).toBeVisible();
  });
});
