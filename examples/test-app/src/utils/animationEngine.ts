/**
 * 🦊 Modular Animation Engine
 * Reusable animation system for phyllotactic spiral games and other visualizations
 */

import type { AnimationConfig } from "./animation/AnimationTypes";
import { createAnimationCore } from "./animation/AnimationCore";

/**
 * Create a modular animation engine
 */
export function createAnimationEngine(
  config: AnimationConfig = {
    frameRate: 60,
    maxFPS: 120,
    enableVSync: true,
    enablePerformanceMonitoring: true,
  },
) {
  return createAnimationCore(config);
}

// Re-export types and other engines
export type {
  AnimationConfig,
  AnimationCallbacks,
} from "./animation/AnimationTypes";
export { createThrottledAnimationEngine } from "./animation/ThrottledAnimation";
export { createAdaptiveAnimationEngine } from "./animation/AdaptiveAnimation";
