/**
 * 🦊 Adaptive Animation Engine
 * Quality-adaptive animation engine that adjusts based on performance
 */

import { log } from "reynard-error-boundaries";
import type { AnimationCallbacks } from "../types";
import { createAnimationCore } from "../core/AnimationCore";
import { createQualityManager } from "./QualityManager";
import { createAdaptiveCallbacks } from "./AdaptiveCallbacks";
import { DEFAULT_ADAPTIVE_CONFIG } from "./AdaptiveConfig";

export function createAdaptiveAnimationEngine(config = DEFAULT_ADAPTIVE_CONFIG) {
  const engine = createAnimationCore(config);
  const qualityManager = createQualityManager(config);
  let isInitialized = false;

  const adaptiveStart = (callbacks: AnimationCallbacks) => {
    if (isInitialized) {
      log.warn("Already initialized, ignoring start request", undefined, {
        component: "AdaptiveAnimation",
        function: "start",
      });
      return;
    }

    isInitialized = true;
    const adaptiveCallbacks = createAdaptiveCallbacks(callbacks, qualityManager, engine);
    engine.start(adaptiveCallbacks);
  };

  const stop = () => {
    isInitialized = false;
    engine.stop();
  };

  const reset = () => {
    isInitialized = false;
    qualityManager.reset();
    engine.reset();
  };

  return {
    ...engine,
    start: adaptiveStart,
    stop,
    reset,
    getCurrentQuality: qualityManager.getCurrentQuality,
    getQualityLevel: qualityManager.getQualityLevel,
  };
}
