/**
 * Tests for preference hooks (usePrefersReducedMotion, usePrefersDarkMode, etc.)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import {
  usePrefersReducedMotion,
  usePrefersDarkMode,
  usePrefersHighContrast,
} from "../useMediaQuery";
import {
  createMockMediaQuery,
  setupMatchMediaMock,
  cleanupMatchMediaMock,
} from "./media-query-test-setup";

describe("Preference Hooks", () => {
  let mockMatchMedia: ReturnType<typeof setupMatchMediaMock>;

  beforeEach(() => {
    mockMatchMedia = setupMatchMediaMock();
  });

  afterEach(() => {
    cleanupMatchMediaMock();
  });

  describe("Function Signatures", () => {
    it("should provide reduced motion preference hook", () => {
      expect(typeof usePrefersReducedMotion).toBe("function");
      expect(usePrefersReducedMotion.length).toBe(0);
    });

    it("should provide dark mode preference hook", () => {
      expect(typeof usePrefersDarkMode).toBe("function");
      expect(usePrefersDarkMode.length).toBe(0);
    });

    it("should provide high contrast preference hook", () => {
      expect(typeof usePrefersHighContrast).toBe("function");
      expect(usePrefersHighContrast.length).toBe(0);
    });
  });

  describe("Hook Integration", () => {
    it("should provide reduced motion preference hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const prefersReducedMotion = usePrefersReducedMotion();
        expect(typeof prefersReducedMotion).toBe("function");
        expect(prefersReducedMotion()).toBe(false);
      });
    });

    it("should provide dark mode preference hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const prefersDarkMode = usePrefersDarkMode();
        expect(typeof prefersDarkMode).toBe("function");
        expect(prefersDarkMode()).toBe(false);
      });
    });

    it("should provide high contrast preference hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const prefersHighContrast = usePrefersHighContrast();
        expect(typeof prefersHighContrast).toBe("function");
        expect(prefersHighContrast()).toBe(false);
      });
    });
  });
});
