/**
 * 🦊 3D Phyllotactic Performance
 * Performance metrics and optimization utilities for 3D phyllotactic systems
 */

import type {
  Phyllotactic3DConfig,
  PerformanceMetrics,
} from "./Phyllotactic3DConfig";

export class Phyllotactic3DPerformance {
  /**
   * Calculate 3D performance metrics
   */
  static calculate3DPerformanceMetrics(
    config: Phyllotactic3DConfig,
  ): PerformanceMetrics {
    const baseComplexity = config.pointCount * 3; // 3D coordinates
    const stroboscopicOverhead = config.enableStroboscopic3D ? 1.2 : 1.0;
    const sphericalOverhead = config.enableSphericalProjection ? 1.3 : 1.0;

    const complexity =
      baseComplexity * stroboscopicOverhead * sphericalOverhead;
    const renderingCost = complexity * 1.5; // 3D rendering is more expensive
    const memoryUsage = config.pointCount * 96; // 3D points use more memory

    return {
      complexity,
      renderingCost,
      memoryUsage,
      stroboscopicOverhead: stroboscopicOverhead - 1,
    };
  }

  /**
   * Estimate frame rate based on configuration
   */
  static estimateFrameRate(config: Phyllotactic3DConfig): number {
    const metrics = this.calculate3DPerformanceMetrics(config);
    const baseFrameRate = 60;
    const complexityFactor = Math.max(0.1, 1 - metrics.complexity / 10000);

    return Math.max(15, baseFrameRate * complexityFactor);
  }

  /**
   * Calculate memory usage breakdown
   */
  static calculateMemoryBreakdown(config: Phyllotactic3DConfig): {
    points: number;
    colors: number;
    sizes: number;
    rotations: number;
    total: number;
  } {
    const pointSize = 96; // bytes per 3D point
    const colorSize = 16; // bytes per color string
    const sizeSize = 8; // bytes per size value
    const rotationSize = 24; // bytes per rotation state

    const points = config.pointCount * pointSize;
    const colors = config.pointCount * colorSize;
    const sizes = config.pointCount * sizeSize;
    const rotations = rotationSize; // single rotation state

    return {
      points,
      colors,
      sizes,
      rotations,
      total: points + colors + sizes + rotations,
    };
  }

  /**
   * Optimize configuration for target performance
   */
  static optimizeForPerformance(
    config: Phyllotactic3DConfig,
    targetFrameRate: number = 30,
  ): Partial<Phyllotactic3DConfig> {
    const currentFrameRate = this.estimateFrameRate(config);

    if (currentFrameRate >= targetFrameRate) {
      return {}; // No optimization needed
    }

    const optimizationFactor = targetFrameRate / currentFrameRate;
    const optimizedConfig: Partial<Phyllotactic3DConfig> = {};

    // Reduce point count if needed
    if (optimizationFactor < 0.8) {
      optimizedConfig.pointCount = Math.floor(
        config.pointCount * optimizationFactor,
      );
    }

    // Disable expensive features if needed
    if (optimizationFactor < 0.6) {
      optimizedConfig.enableStroboscopic3D = false;
    }

    if (optimizationFactor < 0.4) {
      optimizedConfig.enableSphericalProjection = false;
    }

    return optimizedConfig;
  }

  /**
   * Calculate LOD (Level of Detail) based on distance
   */
  static calculateLOD(
    distance: number,
    maxDistance: number = 1000,
  ): { pointCount: number; detailLevel: number } {
    const normalizedDistance = Math.min(1, distance / maxDistance);
    const detailLevel = 1 - normalizedDistance;

    // Reduce point count based on distance
    const basePointCount = 1000;
    const pointCount = Math.floor(basePointCount * detailLevel);

    return {
      pointCount: Math.max(100, pointCount),
      detailLevel,
    };
  }

  /**
   * Benchmark performance for different configurations
   */
  static benchmarkConfigurations(configs: Phyllotactic3DConfig[]): Array<{
    config: Phyllotactic3DConfig;
    metrics: PerformanceMetrics;
    frameRate: number;
  }> {
    return configs.map((config) => ({
      config,
      metrics: this.calculate3DPerformanceMetrics(config),
      frameRate: this.estimateFrameRate(config),
    }));
  }
}
