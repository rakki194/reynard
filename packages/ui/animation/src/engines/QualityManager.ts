/**
 * 🦊 Quality Manager
 * Manages quality levels and adaptation logic for adaptive animation
 */

import { log } from "reynard-error-boundaries";
import type { AdaptiveConfig } from "./AdaptiveConfig";

export interface QualityManager {
  getCurrentQuality: () => number;
  getQualityLevel: () => number;
  adaptQuality: (currentFPS: number) => void;
  reset: () => void;
}

export function createQualityManager(config: AdaptiveConfig): QualityManager {
  let currentQualityIndex = 0;
  let lowFPSFrames = 0;
  let highFPSFrames = 0;

  const adaptQuality = (currentFPS: number) => {
    // Adapt quality based on performance
    if (currentFPS < config.targetFPS) {
      lowFPSFrames++;
      highFPSFrames = 0;

      if (lowFPSFrames >= config.adaptationThreshold && currentQualityIndex < config.qualityLevels.length - 1) {
        currentQualityIndex++;
        lowFPSFrames = 0;
        if (config.enablePerformanceMonitoring) {
          log.debug(
            "Reduced quality",
            {
              level: currentQualityIndex,
              percentage: config.qualityLevels[currentQualityIndex] * 100,
            },
            {
              component: "QualityManager",
              function: "adaptQuality",
            }
          );
        }
      }
    } else if (currentFPS > config.targetFPS + 10) {
      highFPSFrames++;
      lowFPSFrames = 0;

      if (highFPSFrames >= config.adaptationThreshold && currentQualityIndex > 0) {
        currentQualityIndex--;
        highFPSFrames = 0;
        if (config.enablePerformanceMonitoring) {
          log.debug(
            "Increased quality",
            {
              level: currentQualityIndex,
              percentage: config.qualityLevels[currentQualityIndex] * 100,
            },
            {
              component: "QualityManager",
              function: "adaptQuality",
            }
          );
        }
      }
    }
  };

  const getCurrentQuality = () => config.qualityLevels[currentQualityIndex];

  const getQualityLevel = () => currentQualityIndex;

  const reset = () => {
    currentQualityIndex = 0;
    lowFPSFrames = 0;
    highFPSFrames = 0;
  };

  return {
    getCurrentQuality,
    getQualityLevel,
    adaptQuality,
    reset,
  };
}
