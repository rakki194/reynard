/**
 * Tests for core i18n module creation and basic functionality
 * Covers module initialization and basic properties
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule, createBasicI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Core Module Creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  it("should create enhanced i18n module with default options", () => {
    const i18n = createI18nModule();

    expect(i18n).toHaveProperty("locale");
    expect(i18n).toHaveProperty("setLocale");
    expect(i18n).toHaveProperty("languages");
    expect(i18n).toHaveProperty("t");
    expect(i18n).toHaveProperty("isRTL");
    expect(i18n).toHaveProperty("loadTranslations");
  });

  it("should create basic i18n module for backward compatibility", () => {
    const i18n = createBasicI18nModule();

    expect(i18n).toHaveProperty("locale");
    expect(i18n).toHaveProperty("setLocale");
    expect(i18n).toHaveProperty("languages");
    expect(i18n).toHaveProperty("t");
    expect(i18n).toHaveProperty("isRTL");
    expect(i18n).toHaveProperty("loadTranslations");
  });

  it("should initialize with correct default locale", () => {
    const i18n = createI18nModule();

    expect(i18n.locale()).toBe("en");
  });

  it("should initialize with available languages", () => {
    const i18n = createI18nModule();

    expect(Array.isArray(i18n.languages)).toBe(true);
    expect(i18n.languages.length).toBeGreaterThan(0);
  });
});
