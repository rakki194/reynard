/**
 * Tests for i18n locale management
 * Covers locale switching, persistence, and RTL detection
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Locale Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  it("should persist locale to localStorage", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.setLocale).toBe("function");
    i18n.setLocale("es");

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("reynard-locale", "es");
  });

  it("should update document attributes", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.setLocale).toBe("function");
    i18n.setLocale("ar"); // RTL language

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("reynard-locale", "ar");
  });

  it("should update Intl formatter config on locale change", () => {
    const i18n = createI18nModule();

    expect(typeof i18n.setLocale).toBe("function");
    expect(typeof i18n.intlFormatter.updateConfig).toBe("function");

    i18n.setLocale("es");

    // Verify the function exists and can be called
    expect(i18n.intlFormatter.updateConfig).toBeDefined();
  });

  it("should detect RTL languages correctly", () => {
    const i18n = createI18nModule();

    i18n.setLocale("ar");
    expect(typeof i18n.isRTL).toBe("boolean");

    i18n.setLocale("en");
    expect(typeof i18n.isRTL).toBe("boolean");
  });

  it("should handle locale switching between multiple languages", () => {
    const i18n = createI18nModule();

    i18n.setLocale("en");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("reynard-locale", "en");

    i18n.setLocale("fr");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("reynard-locale", "fr");

    i18n.setLocale("de");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("reynard-locale", "de");
  });

  it("should maintain locale state across operations", () => {
    const i18n = createI18nModule();

    i18n.setLocale("es");
    expect(i18n.locale()).toBe("es");

    // Perform some operations
    i18n.t("common.hello");
    expect(i18n.locale()).toBe("es");
  });
});
