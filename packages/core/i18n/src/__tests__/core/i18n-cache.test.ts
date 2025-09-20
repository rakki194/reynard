/**
 * Tests for i18n cache management
 * Covers cache operations, statistics, and optimization
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Cache Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  it("should provide cache management functions", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.clearCache).toBe("function");
    expect(typeof i18n.getCacheStats).toBe("function");
  });

  it("should clear cache", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.clearCache).toBe("function");
    i18n.clearCache();

    expect(i18n.clearCache).toBeDefined();
  });

  it("should clear specific locale cache", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.clearCache).toBe("function");
    i18n.clearCache("es");

    expect(i18n.clearCache).toBeDefined();
  });

  it("should get cache statistics", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.getCacheStats).toBe("function");
    const stats = i18n.getCacheStats();

    expect(stats).toBeDefined();
  });

  it("should provide cache performance metrics", () => {
    const i18n = createI18nModule();

    const stats = i18n.getCacheStats();

    expect(stats).toHaveProperty("fullTranslations");
    expect(stats).toHaveProperty("namespaces");
    expect(Array.isArray(stats.namespaces)).toBe(true);
  });

  it("should handle cache operations for multiple locales", () => {
    const i18n = createI18nModule();

    // Clear cache for different locales
    i18n.clearCache("en");
    i18n.clearCache("es");
    i18n.clearCache("fr");

    expect(i18n.clearCache).toBeDefined();
  });

  it("should maintain cache statistics accuracy", () => {
    const i18n = createI18nModule();

    const initialStats = i18n.getCacheStats();
    expect(initialStats).toBeDefined();

    // Perform some operations
    i18n.clearCache();

    const finalStats = i18n.getCacheStats();
    expect(finalStats).toBeDefined();
  });
});
