/**
 * 🦊 Adaptive Callbacks
 * Creates adaptive callbacks for the animation engine
 */

import type { AnimationCallbacks } from "../types";
import type { QualityManager } from "./QualityManager";
import type { AdaptiveConfig } from "./AdaptiveConfig";

export function createAdaptiveCallbacks(
  callbacks: AnimationCallbacks,
  qualityManager: QualityManager,
  engine: any, // AnimationCore type
): AnimationCallbacks {
  return {
    ...callbacks,
    onFrameEnd: (frameTime: number, frameCount: number) => {
      try {
        const stats = engine.getPerformanceStats();
        qualityManager.adaptQuality(stats.currentFPS);
        callbacks.onFrameEnd?.(frameTime, frameCount);
      } catch (error) {
        console.error(
          "🦊 AdaptiveCallbacks: Error in onFrameEnd callback",
          error,
        );
      }
    },
  };
}
