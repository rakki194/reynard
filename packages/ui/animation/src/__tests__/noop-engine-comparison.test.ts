/**
 * 🦊 NoOp Engine Comparison Tests
 *
 * Compare the bloated NoOp engine vs the simple one
 */

import { describe, it, expect } from "vitest";
import { SimpleNoOpEngine, simpleNoOpEngine } from "../engines/SimpleNoOpEngine";
import { NoOpAnimationEngine } from "../engines/NoOpAnimationEngine";

describe("NoOp Engine Comparison", () => {
  it("should create simple NoOp engine with minimal overhead", () => {
    const startTime = performance.now();
    const engine = new SimpleNoOpEngine();
    const endTime = performance.now();

    const creationTime = endTime - startTime;
    console.log(`Simple NoOp Engine creation: ${creationTime.toFixed(2)}ms`);

    // Should be very fast to create
    expect(creationTime).toBeLessThan(1);
  });

  it("should create complex NoOp engine with more overhead", () => {
    const startTime = performance.now();
    const engine = new NoOpAnimationEngine({
      enableLogging: false,
      enablePerformanceMonitoring: false,
    });
    const endTime = performance.now();

    const creationTime = endTime - startTime;
    console.log(`Complex NoOp Engine creation: ${creationTime.toFixed(2)}ms`);

    // Will be slower due to all the initialization
    expect(creationTime).toBeGreaterThan(0);
  });

  it("should execute simple NoOp engine faster", () => {
    const iterations = 1000;

    // Test simple engine
    const simpleStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      simpleNoOpEngine.start({
        onUpdate: () => {},
        onRender: () => {},
      });
    }
    const simpleEnd = performance.now();
    const simpleDuration = simpleEnd - simpleStart;

    // Test complex engine
    const complexEngine = new NoOpAnimationEngine({
      enableLogging: false,
      enablePerformanceMonitoring: false,
    });

    const complexStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      complexEngine.start({
        onUpdate: () => {},
        onRender: () => {},
      });
    }
    const complexEnd = performance.now();
    const complexDuration = complexEnd - complexStart;

    console.log(`Simple NoOp (${iterations} iterations): ${simpleDuration.toFixed(2)}ms`);
    console.log(`Complex NoOp (${iterations} iterations): ${complexDuration.toFixed(2)}ms`);
    console.log(`Performance difference: ${((complexDuration / simpleDuration - 1) * 100).toFixed(1)}%`);

    // Simple should be faster
    expect(simpleDuration).toBeLessThan(complexDuration);

    // Simple should be very fast
    expect(simpleDuration).toBeLessThan(10); // Less than 10ms for 1000 iterations
  });

  it("should have minimal memory footprint", () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Create many simple engines
    const engines = [];
    for (let i = 0; i < 100; i++) {
      engines.push(new SimpleNoOpEngine());
    }

    const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = afterMemory - initialMemory;

    console.log(`Memory increase for 100 simple engines: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    console.log(`Average per engine: ${(memoryIncrease / 100 / 1024).toFixed(2)}KB`);

    // Should be minimal memory usage
    expect(memoryIncrease).toBeLessThan(100 * 1024); // Less than 100KB for 100 engines
  });

  it("should provide same interface as complex engine", () => {
    const simpleEngine = new SimpleNoOpEngine();

    // Should have all the same methods
    expect(typeof simpleEngine.start).toBe("function");
    expect(typeof simpleEngine.stop).toBe("function");
    expect(typeof simpleEngine.reset).toBe("function");
    expect(typeof simpleEngine.getPerformanceStats).toBe("function");
    expect(typeof simpleEngine.updateConfig).toBe("function");
    expect(typeof simpleEngine.updateCallbacks).toBe("function");
    expect(typeof simpleEngine.pause).toBe("function");
    expect(typeof simpleEngine.resume).toBe("function");
  });

  it("should return consistent performance stats", () => {
    const simpleEngine = new SimpleNoOpEngine();

    const stats = simpleEngine.getPerformanceStats();

    expect(stats.currentFPS).toBe(60);
    expect(stats.averageFPS).toBe(60);
    expect(stats.frameCount).toBe(1);
    expect(stats.frameTime).toBe(0);
    expect(stats.renderTime).toBe(0);
    expect(stats.updateTime).toBe(0);
    expect(stats.isRunning).toBe(false);
  });
});
