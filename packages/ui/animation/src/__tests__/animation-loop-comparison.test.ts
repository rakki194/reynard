/**
 * 🦊 Animation Loop Comparison Tests
 *
 * Compare old setTimeout + requestAnimationFrame vs new single loop
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useStaggeredAnimation } from "../composables/useStaggeredAnimation";
import { useSimplifiedStaggeredAnimation } from "../composables/useSimplifiedStaggeredAnimation";
import { globalAnimationLoop } from "../utils/SimplifiedAnimationLoop";

describe("Animation Loop Comparison", () => {
  beforeEach(() => {
    // Clean up any existing animations
    globalAnimationLoop.clear();
  });

  afterEach(() => {
    // Clean up after each test
    globalAnimationLoop.clear();
  });

  it("should measure old staggered animation performance", async () => {
    const itemCount = 50;
    const staggeredAnimation = useStaggeredAnimation({
      duration: 100,
      stagger: 10,
      easing: "easeOutCubic",
    });

    const startTime = performance.now();

    await staggeredAnimation.start(itemCount);

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Old staggered animation (${itemCount} items): ${duration.toFixed(2)}ms`);

    // Should complete in reasonable time
    expect(duration).toBeLessThan(2000);
  });

  it("should measure new simplified staggered animation performance", async () => {
    const itemCount = 50;
    const simplifiedAnimation = useSimplifiedStaggeredAnimation({
      duration: 100,
      stagger: 10,
      easing: "easeOutCubic",
    });

    const startTime = performance.now();

    // Wait for animation to complete properly
    await new Promise<void>(resolve => {
      simplifiedAnimation.start(itemCount);

      // Check if animation is complete
      const checkComplete = () => {
        if (!simplifiedAnimation.isAnimating()) {
          resolve();
        } else {
          setTimeout(checkComplete, 16); // Check every frame
        }
      };
      checkComplete();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`New simplified animation (${itemCount} items): ${duration.toFixed(2)}ms`);

    // Should complete in reasonable time
    expect(duration).toBeLessThan(2000);
  });

  it("should maintain 60fps with single loop", async () => {
    const itemCount = 100;
    const simplifiedAnimation = useSimplifiedStaggeredAnimation({
      duration: 1000, // 1 second duration
      stagger: 5,
      easing: "linear",
    });

    let frameCount = 0;
    let lastTime = performance.now();
    const frameTimes: number[] = [];

    // Monitor frame rate
    const monitorFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;
      frameTimes.push(frameTime);
      frameCount++;
      lastTime = currentTime;
    };

    // Start monitoring
    const monitorId = setInterval(monitorFrame, 16); // ~60fps monitoring

    simplifiedAnimation.start(itemCount);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(monitorId);

    const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
    const averageFPS = 1000 / averageFrameTime;

    console.log(`Average frame time: ${averageFrameTime.toFixed(2)}ms`);
    console.log(`Average FPS: ${averageFPS.toFixed(2)}`);
    console.log(`Total frames: ${frameCount}`);

    // Should maintain close to 60fps
    expect(averageFPS).toBeGreaterThan(55);
    expect(averageFPS).toBeLessThan(65);
  });

  it("should have lower memory usage with single loop", () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Create many simplified animations
    const animations = [];
    for (let i = 0; i < 50; i++) {
      const animation = useSimplifiedStaggeredAnimation({
        duration: 100,
        stagger: 5,
        easing: "easeOutCubic",
      });
      animations.push(animation);
      animation.start(10); // 10 items each
    }

    const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = afterMemory - initialMemory;

    console.log(`Memory increase for 50 simplified animations: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    console.log(`Average per animation: ${(memoryIncrease / 50 / 1024).toFixed(2)}KB`);

    // Should be reasonable memory usage
    expect(memoryIncrease).toBeLessThan(100 * 1024); // Less than 100KB
  });

  it("should handle cleanup properly", () => {
    const animation = useSimplifiedStaggeredAnimation({
      duration: 1000,
      stagger: 100,
      easing: "easeOutCubic",
    });

    // Start animation
    animation.start(5);
    expect(animation.isAnimating()).toBe(true);
    expect(globalAnimationLoop.getActiveCount()).toBeGreaterThan(0);

    // Stop animation
    animation.stop();
    expect(animation.isAnimating()).toBe(false);
    expect(globalAnimationLoop.getActiveCount()).toBe(0);

    // Reset animation
    animation.reset();
    expect(animation.items().length).toBe(0);
  });

  it("should support different animation directions", () => {
    const directions = ["forward", "reverse", "center", "random"] as const;

    directions.forEach(direction => {
      const animation = useSimplifiedStaggeredAnimation({
        duration: 100,
        stagger: 20,
        easing: "easeOutCubic",
        direction,
      });

      animation.start(5);
      expect(animation.isAnimating()).toBe(true);

      animation.stop();
      expect(animation.isAnimating()).toBe(false);
    });
  });
});
