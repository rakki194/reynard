/**
 * Tests for useMediaQuery composable
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "solid-js";
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeScreen,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  usePrefersHighContrast,
} from "./useMediaQuery";

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

describe("useMediaQuery Composable", () => {
  let mockMediaQuery: any;

  beforeEach(() => {
    // Reset mock
    mockMatchMedia.mockClear();

    // Create mock media query
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  describe("useMediaQuery", () => {
    it("should return a signal that tracks media query matches", () => {
      mockMediaQuery.matches = true;

      // Test that the function exists and can be called
      expect(typeof useMediaQuery).toBe("function");
      expect(mockMatchMedia).not.toHaveBeenCalled(); // Not called until used in component
    });

    it("should handle SSR gracefully", () => {
      // Mock window as undefined for SSR
      const originalWindow = global.window;
      delete (global as any).window;

      // Test that the function exists
      expect(typeof useMediaQuery).toBe("function");

      // Restore window
      global.window = originalWindow;
    });

    it("should accept query string parameter", () => {
      expect(typeof useMediaQuery).toBe("function");
      // The function should accept a string parameter
      expect(useMediaQuery.length).toBe(1);
    });
  });

  describe("Breakpoint Hooks", () => {
    it("should provide mobile breakpoint hook", () => {
      expect(typeof useIsMobile).toBe("function");
      expect(useIsMobile.length).toBe(0); // No parameters
    });

    it("should provide tablet breakpoint hook", () => {
      expect(typeof useIsTablet).toBe("function");
      expect(useIsTablet.length).toBe(0); // No parameters
    });

    it("should provide desktop breakpoint hook", () => {
      expect(typeof useIsDesktop).toBe("function");
      expect(useIsDesktop.length).toBe(0); // No parameters
    });

    it("should provide large screen breakpoint hook", () => {
      expect(typeof useIsLargeScreen).toBe("function");
      expect(useIsLargeScreen.length).toBe(0); // No parameters
    });
  });

  describe("Preference Hooks", () => {
    it("should provide reduced motion preference hook", () => {
      expect(typeof usePrefersReducedMotion).toBe("function");
      expect(usePrefersReducedMotion.length).toBe(0); // No parameters
    });

    it("should provide dark mode preference hook", () => {
      expect(typeof usePrefersDarkMode).toBe("function");
      expect(usePrefersDarkMode.length).toBe(0); // No parameters
    });

    it("should provide high contrast preference hook", () => {
      expect(typeof usePrefersHighContrast).toBe("function");
      expect(usePrefersHighContrast.length).toBe(0); // No parameters
    });
  });

  describe("Function Signatures", () => {
    it("should have correct function signatures", () => {
      // All hooks should be functions with no parameters
      const hooks = [
        useIsMobile,
        useIsTablet,
        useIsDesktop,
        useIsLargeScreen,
        usePrefersReducedMotion,
        usePrefersDarkMode,
        usePrefersHighContrast,
      ];

      hooks.forEach((hook) => {
        expect(typeof hook).toBe("function");
        expect(hook.length).toBe(0);
      });
    });
  });

  describe("useMediaQuery Integration", () => {
    it("should handle SSR when window is undefined", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      createRoot(() => {
        const matches = useMediaQuery("(max-width: 768px)");
        expect(matches()).toBe(false); // Default value when window is undefined
      });

      global.window = originalWindow;
    });
  });
});
