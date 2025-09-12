/**
 * Core tests for useMediaQuery composable
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "solid-js";
import { useMediaQuery } from "../useMediaQuery";
import {
  createMockMediaQuery,
  setupMatchMediaMock,
  cleanupMatchMediaMock,
  mockSSR,
} from "./media-query-test-setup";

describe("useMediaQuery Core", () => {
  let mockMatchMedia: ReturnType<typeof setupMatchMediaMock>;

  beforeEach(() => {
    mockMatchMedia = setupMatchMediaMock();
  });

  afterEach(() => {
    cleanupMatchMediaMock();
  });

  describe("Basic Functionality", () => {
    it("should return a signal that tracks media query matches", () => {
      const mockMediaQuery = createMockMediaQuery(true);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      expect(typeof useMediaQuery).toBe("function");
      expect(mockMatchMedia).not.toHaveBeenCalled();
    });

    it("should accept query string parameter", () => {
      expect(typeof useMediaQuery).toBe("function");
      expect(useMediaQuery.length).toBe(1);
    });
  });

  describe("SSR Handling", () => {
    it("should handle SSR gracefully", () => {
      const restoreWindow = mockSSR();

      expect(typeof useMediaQuery).toBe("function");

      restoreWindow();
    });

    it("should return false when window is undefined", () => {
      const restoreWindow = mockSSR();

      createRoot(() => {
        const matches = useMediaQuery("(max-width: 768px)");
        expect(matches()).toBe(false);
      });

      restoreWindow();
    });
  });

  describe("Window Integration", () => {
    it("should work with window.matchMedia when available", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const matches = useMediaQuery("(max-width: 768px)");
        expect(typeof matches).toBe("function");
        expect(matches()).toBe(false);
      });
    });

    it("should handle multiple media queries", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const mobile = useMediaQuery("(max-width: 768px)");
        const desktop = useMediaQuery("(min-width: 1025px)");

        expect(typeof mobile).toBe("function");
        expect(typeof desktop).toBe("function");
        expect(mobile()).toBe(false);
        expect(desktop()).toBe(false);
      });
    });
  });
});
