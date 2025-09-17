/**
 * 🦊 Throttled Animation Engine
 * Performance-optimized animation engine with throttling
 */

import type { AnimationConfig, AnimationCallbacks } from "./AnimationTypes";
import { createAnimationCore } from "./AnimationCore";

export function createThrottledAnimationEngine(
  config: AnimationConfig & { throttleInterval: number } = {
    frameRate: 60,
    maxFPS: 120,
    enableVSync: true,
    enablePerformanceMonitoring: true,
    throttleInterval: 16, // ~60fps
  }
) {
  const engine = createAnimationCore(config);
  let lastThrottledTime = 0;

  const throttledStart = (callbacks: AnimationCallbacks) => {
    const throttledCallbacks: AnimationCallbacks = {
      ...callbacks,
      onUpdate: (deltaTime: number, frameCount: number) => {
        const now = performance.now();
        if (now - lastThrottledTime >= config.throttleInterval) {
          callbacks.onUpdate?.(deltaTime, frameCount);
          lastThrottledTime = now;
        }
      },
    };

    engine.start(throttledCallbacks);
  };

  return {
    ...engine,
    start: throttledStart,
  };
}
