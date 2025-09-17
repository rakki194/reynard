/**
 * 🦊 3D Phyllotactic System
 * Implements 3D phyllotactic structures inspired by NovaTropes and research
 * Based on "The Mathematics of Phyllotactic Spirals and Their Animated Perception"
 */

import type {
  Phyllotactic3DConfig,
  Phyllotactic3DPoint,
  RotationState,
  PerformanceMetrics,
} from "./Phyllotactic3DConfig";
import { DEFAULT_3D_CONFIG } from "./Phyllotactic3DConfig";
import { Phyllotactic3DMath } from "./Phyllotactic3DMath";
import { Phyllotactic3DRendering } from "./Phyllotactic3DRendering";
import { Phyllotactic3DPerformance } from "./Phyllotactic3DPerformance";

export class Phyllotactic3DSystem {
  private config: Phyllotactic3DConfig;
  private rotation: RotationState = { x: 0, y: 0, z: 0 };

  constructor(config: Partial<Phyllotactic3DConfig> = {}) {
    this.config = { ...DEFAULT_3D_CONFIG, ...config };
  }

  /**
   * Generate 3D phyllotactic spiral
   * Implements 3D extension of Vogel's model
   */
  generate3DSpiral(): Phyllotactic3DPoint[] {
    const points: Phyllotactic3DPoint[] = [];

    for (let i = 0; i < this.config.pointCount; i++) {
      // Generate 3D coordinates using math module
      const coords = Phyllotactic3DMath.generate3DSpiralCoordinates(i, this.config);

      // Apply current rotation
      const rotated = Phyllotactic3DMath.applyRotation(coords.x, coords.y, coords.z, this.rotation);

      // Apply center offset
      const x = rotated.x + this.config.centerX;
      const y = rotated.y + this.config.centerY;
      const z = rotated.z + this.config.centerZ;

      // Calculate stroboscopic intensity
      const stroboscopicIntensity = Phyllotactic3DMath.calculate3DStroboscopicIntensity(i, this.rotation, this.config);

      points.push({
        index: i,
        x,
        y,
        z,
        radius: coords.radius,
        angle: coords.angle,
        height: z,
        color: Phyllotactic3DRendering.generate3DColor(i, this.config),
        size: Phyllotactic3DRendering.calculate3DSize(i, this.config),
        stroboscopicIntensity,
      });
    }

    return points;
  }

  /**
   * Update rotation for animation
   */
  updateRotation(deltaTime: number): void {
    this.rotation = Phyllotactic3DMath.updateRotation(this.rotation, this.config, deltaTime);
  }

  /**
   * Get current rotation state
   */
  getRotation(): RotationState {
    return { ...this.rotation };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<Phyllotactic3DConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): Phyllotactic3DConfig {
    return { ...this.config };
  }

  /**
   * Calculate 3D performance metrics
   */
  calculate3DPerformanceMetrics(): PerformanceMetrics {
    return Phyllotactic3DPerformance.calculate3DPerformanceMetrics(this.config);
  }
}
