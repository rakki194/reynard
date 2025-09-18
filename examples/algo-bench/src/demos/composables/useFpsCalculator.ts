import type { PhysicsStats } from "../types";

export interface FpsCalculatorConfig {
  setStats: (updater: (prev: PhysicsStats) => PhysicsStats) => void;
}

/**
 * FPS calculation composable
 * Handles frame counting and FPS calculation for performance monitoring
 */
export function useFpsCalculator(config: FpsCalculatorConfig) {
  let frameCount = 0;
  let fpsTime = 0;

  const updateFps = (deltaTime: number) => {
    frameCount++;
    fpsTime += deltaTime;

    if (fpsTime >= 60) {
      config.setStats(prev => ({
        ...prev,
        fps: Math.round((frameCount * 60) / fpsTime),
      }));
      frameCount = 0;
      fpsTime = 0;
    }
  };

  const reset = () => {
    frameCount = 0;
    fpsTime = 0;
  };

  return {
    updateFps,
    reset,
  };
}
