/**
 * 🦊 Animation Controller
 * Manages animation lifecycle and pattern generation
 */

import type { EngineConfig } from "./useEnhancedEngines";
import type { EngineInstances } from "./engineFactory";
import type { Point } from "./types";

export const generatePattern = (engines: EngineInstances, config: EngineConfig): Point[] => {
  console.log("🦊 AnimationController: Generating pattern", config.mode, config.patternType);

  let points: Point[];

  if (config.mode === "3d") {
    points = engines.phyllotactic3D.generate3DSpiral();
  } else {
    points = engines.patternGenerator.generatePattern();
  }

  return points;
};

export const startAnimation = (engines: EngineInstances, onUpdate: (deltaTime: number) => void): void => {
  engines.animationCore.start({
    onUpdate,
    onRender: () => {
      // Render handled in update callback
    },
  });
};

export const stopAnimation = (engines: EngineInstances): void => {
  engines.animationCore.stop();
};
