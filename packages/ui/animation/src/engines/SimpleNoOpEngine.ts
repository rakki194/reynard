/**
 * 🦊 Simple No-Op Animation Engine
 * 
 * Does absolutely nothing. Just calls callbacks immediately.
 * No performance monitoring, no state tracking, no bullshit.
 */

import type { AnimationEngine, AnimationCallbacks } from "../types/index.js";

export class SimpleNoOpEngine implements AnimationEngine {
  start(callbacks: AnimationCallbacks): void {
    // Just call the callbacks immediately and be done with it
    callbacks.onFrameStart?.(performance.now());
    callbacks.onUpdate?.(0, 0);
    callbacks.onRender?.(0, 0);
    callbacks.onFrameEnd?.(0, 0);
  }

  stop(): void {
    // Do nothing
  }

  reset(): void {
    // Do nothing
  }

  getPerformanceStats() {
    return {
      currentFPS: 60,
      averageFPS: 60,
      frameCount: 1,
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
      isRunning: false,
    };
  }

  updateConfig(): void {
    // Do nothing
  }

  updateCallbacks(): void {
    // Do nothing
  }

  async pause() {
    return {
      success: true,
      duration: 0,
      progress: 1,
      completed: true,
      cancelled: false,
      error: undefined,
      performanceMetrics: {
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        memoryUsage: 0,
        frameCount: 1,
        averageFrameTime: 0,
      },
    };
  }

  async resume() {
    return {
      success: true,
      duration: 0,
      progress: 1,
      completed: true,
      cancelled: false,
      error: undefined,
      performanceMetrics: {
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        memoryUsage: 0,
        frameCount: 1,
        averageFrameTime: 0,
      },
    };
  }
}

// Global instance - no need for complex factory functions
export const simpleNoOpEngine = new SimpleNoOpEngine();
