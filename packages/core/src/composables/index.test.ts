/**
 * Tests for composables index.ts exports
 */

import { describe, it, expect } from "vitest";
import * as Composables from "./index";

describe("Composables Index Exports", () => {
  it("should export useTheme composable", () => {
    expect(Composables).toHaveProperty("useTheme");
  });

  it("should export useNotifications composable", () => {
    expect(Composables).toHaveProperty("useNotifications");
  });

  it("should export useLocalStorage composable", () => {
    expect(Composables).toHaveProperty("useLocalStorage");
  });

  it("should export useDebounce composable", () => {
    expect(Composables).toHaveProperty("useDebounce");
  });

  it("should export useMediaQuery composable", () => {
    expect(Composables).toHaveProperty("useMediaQuery");
  });
});
