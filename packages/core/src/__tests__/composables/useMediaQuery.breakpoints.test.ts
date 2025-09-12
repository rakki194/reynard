/**
 * Tests for breakpoint hooks (useIsMobile, useIsTablet, etc.)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeScreen,
} from "../../useMediaQuery";
import {
  createMockMediaQuery,
  setupMatchMediaMock,
  cleanupMatchMediaMock,
} from "../media-query-test-setup";

describe("Breakpoint Hooks", () => {
  let mockMatchMedia: ReturnType<typeof setupMatchMediaMock>;

  beforeEach(() => {
    mockMatchMedia = setupMatchMediaMock();
  });

  afterEach(() => {
    cleanupMatchMediaMock();
  });

  describe("Function Signatures", () => {
    it("should provide mobile breakpoint hook", () => {
      expect(typeof useIsMobile).toBe("function");
      expect(useIsMobile.length).toBe(0);
    });

    it("should provide tablet breakpoint hook", () => {
      expect(typeof useIsTablet).toBe("function");
      expect(useIsTablet.length).toBe(0);
    });

    it("should provide desktop breakpoint hook", () => {
      expect(typeof useIsDesktop).toBe("function");
      expect(useIsDesktop.length).toBe(0);
    });

    it("should provide large screen breakpoint hook", () => {
      expect(typeof useIsLargeScreen).toBe("function");
      expect(useIsLargeScreen.length).toBe(0);
    });
  });

  describe("Hook Integration", () => {
    it("should provide mobile breakpoint hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const isMobile = useIsMobile();
        expect(typeof isMobile).toBe("function");
        expect(isMobile()).toBe(false);
      });
    });

    it("should provide tablet breakpoint hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const isTablet = useIsTablet();
        expect(typeof isTablet).toBe("function");
        expect(isTablet()).toBe(false);
      });
    });

    it("should provide desktop breakpoint hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const isDesktop = useIsDesktop();
        expect(typeof isDesktop).toBe("function");
        expect(isDesktop()).toBe(false);
      });
    });

    it("should provide large screen breakpoint hook that returns function", () => {
      const mockMediaQuery = createMockMediaQuery(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      createRoot(() => {
        const isLargeScreen = useIsLargeScreen();
        expect(typeof isLargeScreen).toBe("function");
        expect(isLargeScreen()).toBe(false);
      });
    });
  });
});
