/**
 * 🦊 Tests for Enhanced useStaggeredAnimation
 * 
 * Tests the smart import system, fallback animations, and global animation control integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useStaggeredAnimation } from "../composables/useStaggeredAnimation.js";

// Mock the animation package
vi.mock("reynard-animation", () => ({
  useStaggeredAnimation: vi.fn(),
}));

// Mock the core composables
vi.mock("reynard-core/composables", () => ({
  useAnimationFallback: vi.fn(),
  useAnimationControl: vi.fn(),
}));

describe("useStaggeredAnimation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Smart Import System", () => {
    it("should use fallback system when animation package is unavailable", async () => {
      // Mock animation package as unavailable
      vi.doMock("reynard-animation", () => {
        throw new Error("Module not found");
      });

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
      }));

      // Should initialize with fallback system
      expect(result.animationEngine()).toBe("fallback");
    });

    it("should use full system when animation package is available", async () => {
      // Mock animation package as available
      vi.doMock("reynard-animation", () => ({
        useStaggeredAnimation: vi.fn(),
      }));

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
      }));

      // Should initialize with full system
      expect(result.animationEngine()).toBe("full");
    });

    it("should disable animations when no system is available", async () => {
      // Mock both systems as unavailable
      vi.doMock("reynard-animation", () => {
        throw new Error("Module not found");
      });
      vi.doMock("reynard-core/composables", () => {
        throw new Error("Module not found");
      });

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: false,
        respectGlobalControl: false,
      }));

      // Should initialize with disabled system
      expect(result.animationEngine()).toBe("disabled");
    });
  });

  describe("Fallback Animation System", () => {
    it("should create fallback staggered animation", async () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
        duration: 200,
        staggerStep: 50,
      }));

      const items = [1, 2, 3, 4, 5];

      await act(async () => {
        await result.startAnimation(items);
      });

      expect(result.totalItems()).toBe(items.length);
      expect(result.isAnimating()).toBe(false); // Should complete
    });

    it("should respect animation direction", async () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
        direction: "reverse",
        staggerStep: 100,
      }));

      const items = [1, 2, 3];

      await act(async () => {
        await result.startAnimation(items);
      });

      // Check that delays are calculated correctly for reverse direction
      expect(result.getDelayForIndex(0)).toBeGreaterThan(result.getDelayForIndex(2));
    });

    it("should handle center-out direction", async () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
        direction: "center-out",
        staggerStep: 100,
      }));

      const items = [1, 2, 3, 4, 5];

      await act(async () => {
        await result.startAnimation(items);
      });

      // Center item (index 2) should have the smallest delay
      const centerDelay = result.getDelayForIndex(2);
      const edgeDelay = result.getDelayForIndex(0);
      expect(centerDelay).toBeLessThan(edgeDelay);
    });
  });

  describe("Global Animation Control Integration", () => {
    it("should respect global animation control when available", async () => {
      const mockGlobalControl = {
        isAnimationsDisabled: vi.fn(() => true),
      };

      vi.doMock("reynard-core/composables", () => ({
        useAnimationControl: () => mockGlobalControl,
      }));

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: true,
      }));

      expect(result.isAnimationsDisabled()).toBe(true);
    });

    it("should ignore global control when respectGlobalControl is false", async () => {
      const mockGlobalControl = {
        isAnimationsDisabled: vi.fn(() => true),
      };

      vi.doMock("reynard-core/composables", () => ({
        useAnimationControl: () => mockGlobalControl,
      }));

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
      }));

      expect(result.isAnimationsDisabled()).toBe(false);
    });
  });

  describe("Immediate Completion for Disabled Animations", () => {
    it("should complete immediately when animations are disabled", async () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: false,
        respectGlobalControl: false,
      }));

      const items = [1, 2, 3, 4, 5];

      await act(async () => {
        await result.startAnimation(items);
      });

      // Should complete immediately
      expect(result.isAnimating()).toBe(false);
      expect(result.currentIndex()).toBe(items.length - 1);
    });

    it("should return zero delay when animations are disabled", () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: false,
        respectGlobalControl: false,
      }));

      expect(result.getDelayForIndex(0)).toBe(0);
      expect(result.getDelayForIndex(5)).toBe(0);
    });
  });

  describe("Performance Optimizations", () => {
    it("should use performance-optimized fallback when needed", async () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
        duration: 1000, // Long duration
        staggerStep: 500, // Long stagger
      }));

      const items = [1, 2, 3];

      await act(async () => {
        await result.startAnimation(items);
      });

      // Should complete faster than the configured duration
      expect(result.isAnimating()).toBe(false);
    });
  });

  describe("Accessibility Compliance", () => {
    it("should respect prefers-reduced-motion", () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
      }));

      // Should complete immediately for reduced motion
      expect(result.getDelayForIndex(0)).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle import errors gracefully", async () => {
      // Mock import errors
      vi.doMock("reynard-animation", () => {
        throw new Error("Import failed");
      });
      vi.doMock("reynard-core/composables", () => {
        throw new Error("Import failed");
      });

      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: true,
      }));

      // Should fallback to disabled state
      expect(result.animationEngine()).toBe("disabled");
    });

    it("should handle animation start errors gracefully", async () => {
      const { result } = renderHook(() => useStaggeredAnimation({
        useFallback: true,
        respectGlobalControl: false,
      }));

      // Start animation twice should not cause errors
      const items = [1, 2, 3];

      await act(async () => {
        await result.startAnimation(items);
        await result.startAnimation(items); // Second call should be ignored
      });

      expect(result.isAnimating()).toBe(false);
    });
  });
});
