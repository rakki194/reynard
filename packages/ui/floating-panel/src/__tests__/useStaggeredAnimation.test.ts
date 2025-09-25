/**
 * 🦊 Tests for Enhanced useStaggeredAnimation
 *
 * Tests the fallback animation system functionality.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@solidjs/testing-library";
import { useStaggeredAnimation } from "../composables/useStaggeredAnimation.js";

describe("useStaggeredAnimation", () => {
  describe("Fallback Animation System", () => {
    it("should create fallback staggered animation", async () => {
      const { result } = renderHook(() =>
        useStaggeredAnimation({
          baseDelay: 100,
          staggerStep: 50,
          direction: "forward",
        })
      );

      // Should have fallback animation engine
      expect(result.animationEngine()).toBe("fallback");

      // Should not be animating initially
      expect(result.isAnimating()).toBe(false);
      expect(result.currentIndex()).toBe(0);
      expect(result.totalItems()).toBe(0);
    });

    it("should start animation with items", async () => {
      const { result } = renderHook(() =>
        useStaggeredAnimation({
          baseDelay: 100,
          staggerStep: 50,
          direction: "forward",
        })
      );

      const items = [1, 2, 3, 4, 5];

      await result.startAnimation(items);

      expect(result.totalItems()).toBe(items.length);

      // Wait for the animation to complete (100ms timeout)
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(result.isAnimating()).toBe(false); // Should complete quickly
    });

    it("should calculate delay and stop animation", () => {
      const { result } = renderHook(() =>
        useStaggeredAnimation({
          baseDelay: 100,
          staggerStep: 50,
          direction: "forward",
        })
      );

      // Should calculate delays correctly
      expect(result.getDelayForIndex(0)).toBe(0);
      expect(result.getDelayForIndex(1)).toBe(100);
      expect(result.getDelayForIndex(2)).toBe(200);

      // Should be able to stop animation
      result.stopAnimation();
      expect(result.isAnimating()).toBe(false);
      expect(result.currentIndex()).toBe(0);
    });

    it("should handle different directions and work as fallback", () => {
      const { result: resultReverse } = renderHook(() =>
        useStaggeredAnimation({
          baseDelay: 100,
          staggerStep: 50,
          direction: "reverse",
        })
      );

      // Should still work with reverse direction
      expect(resultReverse.animationEngine()).toBe("fallback");
      expect(resultReverse.getDelayForIndex(0)).toBe(0);

      const { result: resultCenterOut } = renderHook(() =>
        useStaggeredAnimation({
          baseDelay: 100,
          staggerStep: 50,
          direction: "center-out",
        })
      );

      // Should still work with center-out direction
      expect(resultCenterOut.animationEngine()).toBe("fallback");
      expect(resultCenterOut.getDelayForIndex(0)).toBe(0);
    });
  });
});
