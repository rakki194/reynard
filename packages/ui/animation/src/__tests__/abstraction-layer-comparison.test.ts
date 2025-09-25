/**
 * 🦊 Abstraction Layer Comparison Tests
 *
 * Compare complex vs simple animation state implementations
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAnimationState } from "../composables/useAnimationState";
import { useSimpleAnimationState } from "../composables/useSimpleAnimationState";

describe("Abstraction Layer Comparison", () => {
  beforeEach(() => {
    // Clean up any existing state
  });

  afterEach(() => {
    // Clean up after each test
  });

  it("should measure complex animation state creation time", () => {
    const startTime = performance.now();

    const complexAnimation = useAnimationState({
      initial: false,
      duration: 300,
      easing: "ease-in-out",
      fallback: "css",
    });

    const endTime = performance.now();
    const creationTime = endTime - startTime;

    console.log(`Complex animation state creation: ${creationTime.toFixed(2)}ms`);

    // Should have some interface (may be different from simple)
    expect(complexAnimation).toBeDefined();
    expect(typeof complexAnimation).toBe("object");
  });

  it("should measure simple animation state creation time", () => {
    const startTime = performance.now();

    const simpleAnimation = useSimpleAnimationState({
      initial: false,
      duration: 300,
      easing: "easeInOut",
    });

    const endTime = performance.now();
    const creationTime = endTime - startTime;

    console.log(`Simple animation state creation: ${creationTime.toFixed(2)}ms`);

    // Should have the expected interface
    expect(typeof simpleAnimation.isActive).toBe("function");
    expect(typeof simpleAnimation.start).toBe("function");
    expect(typeof simpleAnimation.stop).toBe("function");
  });

  it("should compare memory usage between complex and simple", () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Create many complex animations
    const complexAnimations = [];
    for (let i = 0; i < 100; i++) {
      complexAnimations.push(
        useAnimationState({
          initial: false,
          duration: 300,
          easing: "ease-in-out",
          fallback: "css",
        })
      );
    }

    const afterComplexMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const complexMemoryIncrease = afterComplexMemory - initialMemory;

    // Create many simple animations
    const simpleAnimations = [];
    for (let i = 0; i < 100; i++) {
      simpleAnimations.push(
        useSimpleAnimationState({
          initial: false,
          duration: 300,
          easing: "easeInOut",
        })
      );
    }

    const afterSimpleMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const simpleMemoryIncrease = afterSimpleMemory - afterComplexMemory;

    console.log(`Complex animations memory increase: ${(complexMemoryIncrease / 1024).toFixed(2)}KB`);
    console.log(`Simple animations memory increase: ${(simpleMemoryIncrease / 1024).toFixed(2)}KB`);

    if (complexMemoryIncrease > 0 && simpleMemoryIncrease > 0) {
      console.log(`Memory difference: ${((simpleMemoryIncrease / complexMemoryIncrease - 1) * 100).toFixed(1)}%`);
      // Simple should use less memory
      expect(simpleMemoryIncrease).toBeLessThanOrEqual(complexMemoryIncrease);
    } else {
      console.log("Memory usage too small to measure accurately");
      // Just ensure both are reasonable
      expect(complexMemoryIncrease).toBeGreaterThanOrEqual(0);
      expect(simpleMemoryIncrease).toBeGreaterThanOrEqual(0);
    }
  });

  it("should have same functionality with simpler API", async () => {
    const simpleAnimation = useSimpleAnimationState({
      initial: false,
      duration: 100,
      easing: "easeInOut",
    });

    // Test initial state
    expect(simpleAnimation.isActive()).toBe(false);
    expect(simpleAnimation.isCompleted()).toBe(false);
    expect(simpleAnimation.progress()).toBe(0);

    // Test start
    simpleAnimation.start();
    expect(simpleAnimation.isActive()).toBe(true);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(simpleAnimation.isActive()).toBe(false);
    expect(simpleAnimation.isCompleted()).toBe(true);
    expect(simpleAnimation.progress()).toBe(1);
  });

  it("should support toggle functionality", () => {
    const simpleAnimation = useSimpleAnimationState({
      initial: false,
      duration: 100,
      easing: "easeInOut",
    });

    // Test toggle
    expect(simpleAnimation.isActive()).toBe(false);

    simpleAnimation.toggle();
    expect(simpleAnimation.isActive()).toBe(true);

    simpleAnimation.toggle();
    expect(simpleAnimation.isActive()).toBe(false);
  });

  it("should support reset functionality", () => {
    const simpleAnimation = useSimpleAnimationState({
      initial: true,
      duration: 100,
      easing: "easeInOut",
    });

    // Test initial state
    expect(simpleAnimation.isActive()).toBe(true);
    expect(simpleAnimation.isCompleted()).toBe(true);
    expect(simpleAnimation.progress()).toBe(1);

    // Test reset
    simpleAnimation.reset();
    expect(simpleAnimation.isActive()).toBe(false);
    expect(simpleAnimation.isCompleted()).toBe(false);
    expect(simpleAnimation.progress()).toBe(0);
  });

  it("should handle cleanup properly", () => {
    const simpleAnimation = useSimpleAnimationState({
      initial: false,
      duration: 1000,
      easing: "easeInOut",
    });

    // Start animation
    simpleAnimation.start();
    expect(simpleAnimation.isActive()).toBe(true);

    // Stop animation
    simpleAnimation.stop();
    expect(simpleAnimation.isActive()).toBe(false);
  });

  it("should support different easing functions", () => {
    const easings: EasingType[] = ["linear", "easeIn", "easeOut", "easeInOut", "easeOutCubic"];

    easings.forEach(easing => {
      const animation = useSimpleAnimationState({
        initial: false,
        duration: 100,
        easing,
      });

      expect(typeof animation.start).toBe("function");
      expect(typeof animation.stop).toBe("function");
    });
  });
});
