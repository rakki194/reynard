/**
 * 🦊 3D Phyllotactic Mathematics
 * Mathematical operations for 3D phyllotactic transformations
 */

import { GOLDEN_ANGLE } from "../phyllotactic-constants";
import type {
  Phyllotactic3DConfig,
  RotationState,
} from "./Phyllotactic3DConfig";

export class Phyllotactic3DMath {
  /**
   * Project 2D spiral to sphere surface
   * Inspired by spherical phyllotaxis research
   */
  static projectToSphere(
    x: number,
    y: number,
    z: number,
    sphereRadius: number,
  ): { x: number; y: number; z: number } {
    const distance = Math.sqrt(x * x + y * y + z * z);
    const scale = sphereRadius / distance;

    return {
      x: x * scale,
      y: y * scale,
      z: z * scale,
    };
  }

  /**
   * Apply 3D rotation transformation
   */
  static applyRotation(
    x: number,
    y: number,
    z: number,
    rotation: RotationState,
  ): { x: number; y: number; z: number } {
    // Rotation around X axis
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // Rotation around Y axis
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const x1 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    // Rotation around Z axis
    const cosZ = Math.cos(rotation.z);
    const sinZ = Math.sin(rotation.z);
    const x2 = x1 * cosZ - y1 * sinZ;
    const y2 = x1 * sinZ + y1 * cosZ;

    return { x: x2, y: y2, z: z2 };
  }

  /**
   * Calculate 3D stroboscopic intensity
   * Based on 3D rotation and golden angle
   */
  static calculate3DStroboscopicIntensity(
    _index: number,
    rotation: RotationState,
    config: Phyllotactic3DConfig,
  ): number {
    if (!config.enableStroboscopic3D) return 0;

    const goldenAngle = (GOLDEN_ANGLE * Math.PI) / 180;
    const totalRotation = Math.sqrt(
      rotation.x * rotation.x +
        rotation.y * rotation.y +
        rotation.z * rotation.z,
    );

    const stroboscopicPhase = (totalRotation / goldenAngle) % 1;
    const intensity = Math.abs(Math.sin(stroboscopicPhase * Math.PI * 2));

    return intensity > config.stroboscopicThreshold ? intensity : 0;
  }

  /**
   * Generate 3D spiral coordinates
   */
  static generate3DSpiralCoordinates(
    index: number,
    config: Phyllotactic3DConfig,
  ): { x: number; y: number; z: number; radius: number; angle: number } {
    const goldenAngle = (GOLDEN_ANGLE * Math.PI) / 180;

    // Calculate 2D spiral position
    const radius = config.baseRadius * Math.sqrt(index);
    const angle = index * goldenAngle;

    // Calculate 3D position
    let x = Math.cos(angle) * radius;
    let y = Math.sin(angle) * radius;
    let z = index * config.spiralPitch * config.verticalGrowth;

    // Apply spherical projection if enabled
    if (config.enableSphericalProjection) {
      const sphericalCoords = this.projectToSphere(
        x,
        y,
        z,
        config.sphereRadius,
      );
      x = sphericalCoords.x;
      y = sphericalCoords.y;
      z = sphericalCoords.z;
    }

    return { x, y, z, radius, angle };
  }

  /**
   * Update rotation state based on time delta
   */
  static updateRotation(
    currentRotation: RotationState,
    config: Phyllotactic3DConfig,
    deltaTime: number,
  ): RotationState {
    return {
      x: currentRotation.x + config.rotationSpeedX * deltaTime,
      y: currentRotation.y + config.rotationSpeedY * deltaTime,
      z: currentRotation.z + config.rotationSpeedZ * deltaTime,
    };
  }
}
