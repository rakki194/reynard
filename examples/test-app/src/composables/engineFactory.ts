/**
 * 🦊 Engine Factory
 * Creates and configures animation engines
 */

import { StroboscopicEngine } from "../utils/animation/StroboscopicEngine";
import { AdvancedPatternGenerator } from "../utils/phyllotactic/AdvancedPatternGenerator";
import { Phyllotactic3DSystem } from "../utils/phyllotactic/Phyllotactic3D";
import { PerformanceOptimizedEngine } from "../utils/animation/PerformanceOptimizedEngine";
import { createAnimationCore } from "../utils/animation/AnimationCore";
import type { EngineConfig } from "./useEnhancedEngines";

export interface EngineInstances {
  stroboscopicEngine: StroboscopicEngine;
  patternGenerator: AdvancedPatternGenerator;
  phyllotactic3D: Phyllotactic3DSystem;
  performanceEngine: PerformanceOptimizedEngine;
  animationCore: ReturnType<typeof createAnimationCore>;
}

export const createEngines = (config: EngineConfig): EngineInstances => {
  console.log("🦊 EngineFactory: Creating engines");

  const stroboscopicEngine = new StroboscopicEngine({
    frameRate: 60,
    rotationSpeed: config.rotationSpeed,
    enableTemporalAliasing: true,
    enableMorphingEffects: config.enableMorphing,
  });

  const patternGenerator = new AdvancedPatternGenerator({
    patternType: config.patternType,
    pointCount: config.pointCount,
    baseRadius: 10,
    growthFactor: 1.0,
    enableMorphing: config.enableMorphing,
    enableColorHarmonics: true,
  });

  const phyllotactic3D = new Phyllotactic3DSystem({
    pointCount: config.pointCount,
    baseRadius: 10,
    height: 100,
    spiralPitch: 0.1,
    enableStroboscopic3D: config.enableStroboscopic,
    rotationSpeedX: config.rotationSpeed * 0.01,
    rotationSpeedY: config.rotationSpeed * 0.02,
    rotationSpeedZ: config.rotationSpeed * 0.005,
  });

  const performanceEngine = new PerformanceOptimizedEngine({
    maxPoints: config.pointCount,
    targetFPS: 60,
    enableAdaptiveQuality: config.enablePerformanceOptimization,
    enableSpatialCulling: config.enablePerformanceOptimization,
    enableLOD: config.enablePerformanceOptimization,
    enableBatching: config.enablePerformanceOptimization,
  });

  const animationCore = createAnimationCore({
    frameRate: 60,
    maxFPS: 120,
    enableVSync: true,
    enablePerformanceMonitoring: true,
  });

  return {
    stroboscopicEngine,
    patternGenerator,
    phyllotactic3D,
    performanceEngine,
    animationCore,
  };
};
