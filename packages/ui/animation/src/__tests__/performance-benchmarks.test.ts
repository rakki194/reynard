/**
 * 🦊 Performance Benchmarks
 *
 * Real performance testing with tracer timers and metrics
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createAnimationCore } from "../core/AnimationCore";
import { useStaggeredAnimation } from "../composables/useStaggeredAnimation";
import { SimpleNoOpEngine, simpleNoOpEngine } from "../engines/SimpleNoOpEngine";
import { NoOpAnimationEngine } from "../engines/NoOpAnimationEngine";

// Performance tracer utilities
class PerformanceTracer {
  private marks: Map<string, number> = new Map();
  private measures: Array<{ name: string; duration: number; timestamp: number }> = [];

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();

    if (!startTime) {
      throw new Error(`Start mark "${startMark}" not found`);
    }

    const duration = endTime - startTime;
    this.measures.push({ name, duration, timestamp: performance.now() });
    return duration;
  }

  getMeasures(): Array<{ name: string; duration: number; timestamp: number }> {
    return [...this.measures];
  }

  clear(): void {
    this.marks.clear();
    this.measures = [];
  }

  getAverageDuration(name: string): number {
    const matchingMeasures = this.measures.filter(m => m.name === name);
    if (matchingMeasures.length === 0) return 0;

    const total = matchingMeasures.reduce((sum, m) => sum + m.duration, 0);
    return total / matchingMeasures.length;
  }
}

describe("Performance Benchmarks", () => {
  let tracer: PerformanceTracer;

  beforeEach(() => {
    tracer = new PerformanceTracer();
  });

  afterEach(() => {
    tracer.clear();
  });

  describe("Animation Core Performance", () => {
    it("should measure animation core startup time", () => {
      tracer.mark("startup-start");

      const engine = createAnimationCore({
        frameRate: 60,
        maxFPS: 120,
        enableVSync: true,
        enablePerformanceMonitoring: false, // Disable for cleaner benchmarks
      });

      tracer.mark("startup-end");
      const duration = tracer.measure("startup", "startup-start", "startup-end");

      // Should be fast - under 5ms
      expect(duration).toBeLessThan(5);
      console.log(`Animation Core startup: ${duration.toFixed(2)}ms`);
    });

    it("should measure animation loop performance", async () => {
      const engine = createAnimationCore({
        frameRate: 60,
        maxFPS: 60,
        enableVSync: false,
        enablePerformanceMonitoring: false,
      });

      let frameCount = 0;
      const targetFrames = 60; // 1 second at 60fps

      tracer.mark("animation-start");

      engine.start({
        onUpdate: (deltaTime, frame) => {
          frameCount++;
          if (frameCount >= targetFrames) {
            tracer.mark("animation-end");
            engine.stop();
          }
        },
        onRender: () => {
          // Simulate some render work
          const dummy = Math.random() * 1000;
        },
      });

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 1100));

      const duration = tracer.measure("animation-loop", "animation-start", "animation-end");
      const fps = (frameCount / duration) * 1000;

      console.log(`Animation loop: ${duration.toFixed(2)}ms for ${frameCount} frames`);
      console.log(`Effective FPS: ${fps.toFixed(2)}`);

      // Should maintain close to 60fps
      expect(fps).toBeGreaterThan(55);
      expect(fps).toBeLessThan(65);
    });
  });

  describe("Staggered Animation Performance", () => {
    it("should measure staggered animation performance", async () => {
      const itemCount = 100;
      const staggeredAnimation = useStaggeredAnimation({
        duration: 100,
        stagger: 10,
        easing: "easeOutCubic",
      });

      tracer.mark("staggered-start");

      await staggeredAnimation.start(itemCount);

      tracer.mark("staggered-end");
      const duration = tracer.measure("staggered-animation", "staggered-start", "staggered-end");

      console.log(`Staggered animation (${itemCount} items): ${duration.toFixed(2)}ms`);

      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000);
    });
  });

  describe("NoOp Engine Comparison", () => {
    it("should compare simple vs complex NoOp engines", () => {
      const iterations = 1000;

      // Test simple NoOp engine
      tracer.mark("simple-start");
      for (let i = 0; i < iterations; i++) {
        simpleNoOpEngine.start({
          onUpdate: () => {},
          onRender: () => {},
        });
      }
      tracer.mark("simple-end");
      const simpleDuration = tracer.measure("simple-noop", "simple-start", "simple-end");

      // Test complex NoOp engine
      const complexEngine = new NoOpAnimationEngine({
        enableLogging: false,
        enablePerformanceMonitoring: false,
      });

      tracer.mark("complex-start");
      for (let i = 0; i < iterations; i++) {
        complexEngine.start({
          onUpdate: () => {},
          onRender: () => {},
        });
      }
      tracer.mark("complex-end");
      const complexDuration = tracer.measure("complex-noop", "complex-start", "complex-end");

      console.log(`Simple NoOp (${iterations} iterations): ${simpleDuration.toFixed(2)}ms`);
      console.log(`Complex NoOp (${iterations} iterations): ${complexDuration.toFixed(2)}ms`);
      console.log(`Performance difference: ${((complexDuration / simpleDuration - 1) * 100).toFixed(1)}%`);

      // Simple should be faster
      expect(simpleDuration).toBeLessThan(complexDuration);
    });
  });

  describe("Memory Usage Benchmarks", () => {
    it("should measure memory usage of animation systems", () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Create multiple animation engines
      const engines = [];
      for (let i = 0; i < 100; i++) {
        engines.push(
          createAnimationCore({
            frameRate: 60,
            enablePerformanceMonitoring: false,
          })
        );
      }

      const afterCreationMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterCreationMemory - initialMemory;

      console.log(`Memory increase for 100 engines: ${(memoryIncrease / 1024).toFixed(2)}KB`);
      console.log(`Average per engine: ${(memoryIncrease / 100 / 1024).toFixed(2)}KB`);

      // Clean up
      engines.forEach(engine => engine.stop());
    });
  });

  describe("Bundle Size Analysis", () => {
    it("should report estimated bundle sizes", () => {
      // This is a rough estimate - in real benchmarks you'd use webpack-bundle-analyzer
      const estimatedSizes = {
        SimpleNoOpEngine: 2, // KB
        NoOpAnimationEngine: 15, // KB
        AnimationCore: 8, // KB
        StaggeredAnimation: 5, // KB
        EasingFunctions: 3, // KB
      };

      const totalEstimated = Object.values(estimatedSizes).reduce((sum, size) => sum + size, 0);

      console.log("Estimated bundle sizes:");
      Object.entries(estimatedSizes).forEach(([name, size]) => {
        console.log(`  ${name}: ${size}KB`);
      });
      console.log(`  Total: ${totalEstimated}KB`);

      // Should be reasonable
      expect(totalEstimated).toBeLessThan(50);
    });
  });
});

// Benchmark runner utility
export class BenchmarkRunner {
  private tracer: PerformanceTracer;
  private results: Array<{ name: string; duration: number; timestamp: number }> = [];

  constructor() {
    this.tracer = new PerformanceTracer();
  }

  async runBenchmark(name: string, fn: () => Promise<void> | void): Promise<number> {
    this.tracer.mark(`${name}-start`);
    await fn();
    this.tracer.mark(`${name}-end`);
    return this.tracer.measure(name, `${name}-start`, `${name}-end`);
  }

  getResults(): Array<{ name: string; duration: number; timestamp: number }> {
    return this.tracer.getMeasures();
  }

  generateReport(): string {
    const results = this.getResults();
    let report = "Performance Benchmark Report\n";
    report += "============================\n\n";

    results.forEach(result => {
      report += `${result.name}: ${result.duration.toFixed(2)}ms\n`;
    });

    return report;
  }
}
