/**
 * Tests for main index.ts exports
 */

import { describe, it, expect } from "vitest";
import * as Core from "./index";

describe("Core Framework Exports", () => {
  it("should export theme module", () => {
    expect(Core).toHaveProperty("createThemeModule");
    expect(Core).toHaveProperty("getInitialTheme");
    expect(Core).toHaveProperty("getNextTheme");
    expect(Core).toHaveProperty("themes");
    expect(Core).toHaveProperty("themeIconMap");
  });

  it("should export notifications module", () => {
    expect(Core).toHaveProperty("createNotificationsModule");
  });

  it("should export composables", () => {
    expect(Core).toHaveProperty("useLocalStorage");
    expect(Core).toHaveProperty("useDebounce");
    expect(Core).toHaveProperty("useTheme");
    expect(Core).toHaveProperty("useNotifications");
    expect(Core).toHaveProperty("useMediaQuery");
    expect(Core).toHaveProperty("useI18n");
  });

  it("should export i18n module", () => {
    expect(Core).toHaveProperty("createI18nModule");
    expect(Core).toHaveProperty("languages");
    expect(Core).toHaveProperty("isRTL");
  });
});
