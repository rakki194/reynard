/**
 * Tests for main index.ts exports
 */

import { describe, it, expect } from "vitest";
import * as Core from "./index";

describe("Core Framework Exports", () => {
  it("should export notifications module", () => {
    expect(Core).toHaveProperty("createNotificationsModule");
  });

  it("should export composables", () => {
    expect(Core).toHaveProperty("useLocalStorage");
    expect(Core).toHaveProperty("useDebounce");
    expect(Core).toHaveProperty("useNotifications");
    expect(Core).toHaveProperty("useMediaQuery");
  });

  it("should export utilities", () => {
    expect(Core).toHaveProperty("formatNumber");
    expect(Core).toHaveProperty("formatCurrency");
    expect(Core).toHaveProperty("isValidEmail");
    expect(Core).toHaveProperty("isValidUrl");
  });

  it("should export HTTP clients", () => {
    expect(Core).toHaveProperty("HttpClient");
    expect(Core).toHaveProperty("ApiClient");
  });
});
