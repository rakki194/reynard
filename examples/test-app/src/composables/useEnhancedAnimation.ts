/**
 * 🦊 Enhanced Animation Composable
 * Handles animation logic for the integration demo
 */

import { createSignal } from "solid-js";

export interface AnimationConfig {
  mode: "2d" | "3d";
  rotationSpeed: number;
  enableStroboscopic: boolean;
  enablePerformanceOptimization: boolean;
}

export function useEnhancedAnimation(config: () => AnimationConfig) {
  const [currentAngle, setCurrentAngle] = createSignal(0);

  const createAnimationLoop = (
    engines: any,
    renderer: any,
    _updateMetrics: (frameTime: number, renderTime: number, updateTime: number, pointCount: number) => void
  ) => {
    return (deltaTime: number) => {
      const cfg = config();

      // Check performance throttling
      if (cfg.enablePerformanceOptimization && engines.performanceEngine.shouldSkipUpdate()) {
        return;
      }

      // Update rotation
      const newAngle = currentAngle() + (cfg.rotationSpeed * deltaTime) / 16.67;
      setCurrentAngle(newAngle);

      // Apply stroboscopic effects
      let transformedPoints = engines.currentPoints();
      if (cfg.enableStroboscopic) {
        const stroboscopicState = engines.stroboscopicEngine.calculateStroboscopicEffect(deltaTime);
        engines.setStroboscopicState(stroboscopicState);

        if (stroboscopicState.isStroboscopic) {
          transformedPoints = engines.stroboscopicEngine.applyStroboscopicTransform(transformedPoints, deltaTime);
        }
      }

      // Update 3D rotation
      if (cfg.mode === "3d") {
        engines.phyllotactic3D.updateRotation(deltaTime);
        transformedPoints = engines.phyllotactic3D.generate3DSpiral();
      } else {
        // Rotate 2D points
        transformedPoints = rotate2DPoints(transformedPoints, newAngle);
      }

      engines.setCurrentPoints(transformedPoints);

      // Render with current configuration
      const renderConfig = {
        mode: cfg.mode,
        enableStroboscopic: cfg.enableStroboscopic,
        enablePerformanceOptimization: cfg.enablePerformanceOptimization,
        stroboscopicState: engines.stroboscopicState(),
      };

      const renderStartTime = performance.now();
      renderer.renderPoints(transformedPoints, renderConfig, engines.performanceEngine);
      const renderTime = performance.now() - renderStartTime;

      // Update performance metrics
      const frameTime = deltaTime;
      const updateTime = performance.now() - renderStartTime;

      if (cfg.enablePerformanceOptimization) {
        engines.performanceEngine.updateMetrics(frameTime, renderTime, updateTime, transformedPoints.length);
        engines.setPerformanceMetrics(engines.performanceEngine.getMetrics());
        engines.setQualityLevel(engines.performanceEngine.getCurrentQualityLevel());
      } else {
        engines.setPerformanceMetrics(engines.animationCore.getPerformanceStats());
      }
    };
  };

  const rotate2DPoints = (points: any[], angle: number) => {
    const centerX = 400;
    const centerY = 300;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return points.map(point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;

      return {
        ...point,
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos,
      };
    });
  };

  return {
    currentAngle,
    setCurrentAngle,
    createAnimationLoop,
    rotate2DPoints,
  };
}
