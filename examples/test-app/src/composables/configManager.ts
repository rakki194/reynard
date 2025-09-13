/**
 * 🦊 Configuration Manager
 * Handles engine configuration updates
 */

import type { EngineConfig } from "./useEnhancedEngines";
import type { EngineInstances } from "./engineFactory";

export const updateEngineConfigs = (
  engines: EngineInstances,
  config: EngineConfig
): void => {
  console.log("🦊 ConfigManager: Updating engine configurations");

  engines.stroboscopicEngine.updateConfig({
    rotationSpeed: config.rotationSpeed,
    enableMorphingEffects: config.enableMorphing,
  });

  engines.patternGenerator.updateConfig({
    patternType: config.patternType,
    pointCount: config.pointCount,
    enableMorphing: config.enableMorphing,
  });

  engines.phyllotactic3D.updateConfig({
    pointCount: config.pointCount,
    enableStroboscopic3D: config.enableStroboscopic,
    rotationSpeedX: config.rotationSpeed * 0.01,
    rotationSpeedY: config.rotationSpeed * 0.02,
    rotationSpeedZ: config.rotationSpeed * 0.005,
  });

  engines.performanceEngine.updateConfig({
    maxPoints: config.pointCount,
    enableAdaptiveQuality: config.enablePerformanceOptimization,
    enableSpatialCulling: config.enablePerformanceOptimization,
    enableLOD: config.enablePerformanceOptimization,
    enableBatching: config.enablePerformanceOptimization,
  });
};
