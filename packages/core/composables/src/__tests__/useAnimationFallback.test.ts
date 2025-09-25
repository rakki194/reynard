/**
 * 🦊 Animation Fallback System Tests
 *
 * Tests for the animation fallback system including:
 * - CSS-based fallback animations
 * - Immediate completion for disabled animations
 * - Staggered animation fallbacks
 * - Performance optimizations
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

// Mock the animation control hook
vi.mock("../useAnimationControl", () => ({
  useAnimationControl: () => ({
    isAnimationsDisabled: () => createSignal(false),
    isAnimationPackageAvailable: () => createSignal(false),
  }),
}));

describe("useAnimationFallback", () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    // Create a test element
    testElement = document.createElement("div");
    testElement.style.opacity = "0";
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up test element
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  it("should create fallback animation with CSS transitions", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackAnimation(
        testElement,
        { opacity: "1" },
        { duration: 100, useTransitions: true }
      );

      expect(testElement.style.opacity).toBe("1");
      expect(testElement.style.transition).toContain("opacity");

      return animationPromise;
    });
  });

  it("should create fallback animation without transitions", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackAnimation(
        testElement,
        { opacity: "1" },
        { duration: 100, useTransitions: false }
      );

      expect(testElement.style.opacity).toBe("1");
      expect(testElement.style.transition).toBe("");

      return animationPromise;
    });
  });

  it("should create fallback animation with delay", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackAnimation(
        testElement,
        { opacity: "1" },
        { duration: 100, delay: 50, useTransitions: true }
      );

      expect(testElement.style.opacity).toBe("1");
      expect(testElement.style.transitionDelay).toBe("50ms");

      return animationPromise;
    });
  });

  it("should create fallback staggered animation", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    const elements = [document.createElement("div"), document.createElement("div"), document.createElement("div")];

    elements.forEach(el => {
      el.style.opacity = "0";
      document.body.appendChild(el);
    });

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackStaggeredAnimation(
        elements,
        { opacity: "1" },
        { duration: 100, stagger: 50, direction: "forward" }
      );

      elements.forEach((el, index) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transition).toContain("opacity");
      });

      return animationPromise;
    });

    // Clean up
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  it("should create fallback staggered animation with reverse direction", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    const elements = [document.createElement("div"), document.createElement("div"), document.createElement("div")];

    elements.forEach(el => {
      el.style.opacity = "0";
      document.body.appendChild(el);
    });

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackStaggeredAnimation(
        elements,
        { opacity: "1" },
        { duration: 100, stagger: 50, direction: "reverse" }
      );

      elements.forEach((el, index) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transition).toContain("opacity");
      });

      return animationPromise;
    });

    // Clean up
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  it("should create fallback staggered animation with center direction", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    const elements = [document.createElement("div"), document.createElement("div"), document.createElement("div")];

    elements.forEach(el => {
      el.style.opacity = "0";
      document.body.appendChild(el);
    });

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackStaggeredAnimation(
        elements,
        { opacity: "1" },
        { duration: 100, stagger: 50, direction: "center" }
      );

      elements.forEach((el, index) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transition).toContain("opacity");
      });

      return animationPromise;
    });

    // Clean up
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  it("should create fallback staggered animation with random direction", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    const elements = [document.createElement("div"), document.createElement("div"), document.createElement("div")];

    elements.forEach(el => {
      el.style.opacity = "0";
      document.body.appendChild(el);
    });

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackStaggeredAnimation(
        elements,
        { opacity: "1" },
        { duration: 100, stagger: 50, direction: "random" }
      );

      elements.forEach((el, index) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transition).toContain("opacity");
      });

      return animationPromise;
    });

    // Clean up
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  it("should create fallback staggered animation state", () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      const state = fallback.createFallbackStaggeredAnimationState(3, {
        duration: 100,
        stagger: 50,
        direction: "forward",
      });

      expect(state.items().length).toBe(0);
      expect(state.isAnimating()).toBe(false);

      // Test start
      state.start();
      expect(state.isAnimating()).toBe(true);
      expect(state.items().length).toBe(3);

      // Test stop
      state.stop();
      expect(state.isAnimating()).toBe(false);

      // Test reset
      state.reset();
      expect(state.items().length).toBe(0);
    });
  });

  it("should create fallback animation loop", async () => {
    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      let progress = 0;
      let completed = false;

      const animationPromise = fallback.createFallbackAnimationLoop(
        100,
        p => {
          progress = p;
        },
        () => {
          completed = true;
        }
      );

      expect(progress).toBe(0);
      expect(completed).toBe(false);

      return animationPromise.then(() => {
        expect(progress).toBe(1);
        expect(completed).toBe(true);
      });
    });
  });

  it("should handle disabled animations with immediate completion", async () => {
    // Mock disabled animations
    vi.mocked(require("../useAnimationControl").useAnimationControl).mockReturnValue({
      isAnimationsDisabled: () => createSignal(true),
      isAnimationPackageAvailable: () => createSignal(false),
    });

    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackAnimation(
        testElement,
        { opacity: "1" },
        { duration: 100, useTransitions: true }
      );

      expect(testElement.style.opacity).toBe("1");
      expect(testElement.style.transition).toBe("");

      return animationPromise;
    });
  });

  it("should handle disabled animations in staggered animation", async () => {
    // Mock disabled animations
    vi.mocked(require("../useAnimationControl").useAnimationControl).mockReturnValue({
      isAnimationsDisabled: () => createSignal(true),
      isAnimationPackageAvailable: () => createSignal(false),
    });

    const { useAnimationFallback } = require("../useAnimationFallback");

    const elements = [document.createElement("div"), document.createElement("div"), document.createElement("div")];

    elements.forEach(el => {
      el.style.opacity = "0";
      document.body.appendChild(el);
    });

    render(() => {
      const fallback = useAnimationFallback();

      const animationPromise = fallback.createFallbackStaggeredAnimation(
        elements,
        { opacity: "1" },
        { duration: 100, stagger: 50 }
      );

      elements.forEach((el, index) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transition).toBe("");
      });

      return animationPromise;
    });

    // Clean up
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  it("should handle disabled animations in animation loop", async () => {
    // Mock disabled animations
    vi.mocked(require("../useAnimationControl").useAnimationControl).mockReturnValue({
      isAnimationsDisabled: () => createSignal(true),
      isAnimationPackageAvailable: () => createSignal(false),
    });

    const { useAnimationFallback } = require("../useAnimationFallback");

    render(() => {
      const fallback = useAnimationFallback();

      let progress = 0;
      let completed = false;

      const animationPromise = fallback.createFallbackAnimationLoop(
        100,
        p => {
          progress = p;
        },
        () => {
          completed = true;
        }
      );

      return animationPromise.then(() => {
        expect(progress).toBe(1);
        expect(completed).toBe(true);
      });
    });
  });
});
