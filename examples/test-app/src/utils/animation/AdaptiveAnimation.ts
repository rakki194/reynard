/**
 * 🦊 Adaptive Animation Engine
 * Quality-adaptive animation engine that adjusts based on performance
 */

import type { AnimationConfig, AnimationCallbacks } from "./AnimationTypes";
import { createAnimationCore } from "./AnimationCore";

export function createAdaptiveAnimationEngine(
  config: AnimationConfig & {
    targetFPS: number;
    qualityLevels: number[];
    adaptationThreshold: number;
  } = {
    frameRate: 60,
    maxFPS: 120,
    enableVSync: true,
    enablePerformanceMonitoring: true,
    targetFPS: 60,
    qualityLevels: [1, 0.75, 0.5, 0.25], // Quality multipliers
    adaptationThreshold: 5, // FPS below target for this many frames
  },
) {
  const engine = createAnimationCore(config);
  let currentQualityIndex = 0;
  let lowFPSFrames = 0;
  let highFPSFrames = 0;
  let isInitialized = false;

  const adaptiveStart = (callbacks: AnimationCallbacks) => {
    if (isInitialized) {
      console.warn(
        "🦊 AdaptiveAnimation: Already initialized, ignoring start request",
      );
      return;
    }

    isInitialized = true;

    const adaptiveCallbacks: AnimationCallbacks = {
      ...callbacks,
      onFrameEnd: (frameTime: number, frameCount: number) => {
        try {
          const stats = engine.getPerformanceStats();

          // Adapt quality based on performance
          if (stats.currentFPS < config.targetFPS) {
            lowFPSFrames++;
            highFPSFrames = 0;

            if (
              lowFPSFrames >= config.adaptationThreshold &&
              currentQualityIndex < config.qualityLevels.length - 1
            ) {
              currentQualityIndex++;
              lowFPSFrames = 0;
              if (config.enablePerformanceMonitoring) {
                console.log(
                  `🦊 AdaptiveAnimation: Reduced quality to level ${currentQualityIndex} (${config.qualityLevels[currentQualityIndex] * 100}%)`,
                );
              }
            }
          } else if (stats.currentFPS > config.targetFPS + 10) {
            highFPSFrames++;
            lowFPSFrames = 0;

            if (
              highFPSFrames >= config.adaptationThreshold &&
              currentQualityIndex > 0
            ) {
              currentQualityIndex--;
              highFPSFrames = 0;
              if (config.enablePerformanceMonitoring) {
                console.log(
                  `🦊 AdaptiveAnimation: Increased quality to level ${currentQualityIndex} (${config.qualityLevels[currentQualityIndex] * 100}%)`,
                );
              }
            }
          }

          callbacks.onFrameEnd?.(frameTime, frameCount);
        } catch (error) {
          console.error(
            "🦊 AdaptiveAnimation: Error in onFrameEnd callback",
            error,
          );
        }
      },
    };

    engine.start(adaptiveCallbacks);
  };

  const getCurrentQuality = () => config.qualityLevels[currentQualityIndex];

  const stop = () => {
    isInitialized = false;
    engine.stop();
  };

  const reset = () => {
    isInitialized = false;
    currentQualityIndex = 0;
    lowFPSFrames = 0;
    highFPSFrames = 0;
    engine.reset();
  };

  return {
    ...engine,
    start: adaptiveStart,
    stop,
    reset,
    getCurrentQuality,
    getQualityLevel: () => currentQualityIndex,
  };
}
