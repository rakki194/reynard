/**
 * Tests for modules index.ts exports
 */

import { describe, it, expect } from "vitest";
import * as Modules from "./index";

describe("Modules Index Exports", () => {
  it("should export theme module functions", () => {
    expect(Modules).toHaveProperty("createThemeModule");
    expect(Modules).toHaveProperty("getInitialTheme");
    expect(Modules).toHaveProperty("getNextTheme");
    expect(Modules).toHaveProperty("themes");
    expect(Modules).toHaveProperty("themeIconMap");
  });

  it("should export notifications module functions", () => {
    expect(Modules).toHaveProperty("createNotificationsModule");
  });
});
