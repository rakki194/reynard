/**
 * 🦊 3D Phyllotactic Rendering
 * Rendering utilities for 3D phyllotactic visualization
 */

import { GOLDEN_ANGLE } from "../phyllotactic-constants";
import type { Phyllotactic3DConfig } from "./Phyllotactic3DConfig";

export class Phyllotactic3DRendering {
  /**
   * Generate 3D color based on position and depth
   */
  static generate3DColor(index: number, config: Phyllotactic3DConfig): string {
    const goldenAngle = (GOLDEN_ANGLE * Math.PI) / 180;
    const angle = index * goldenAngle;
    const radius = config.baseRadius * Math.sqrt(index);

    // Base hue from golden angle
    let hue = ((angle * 180) / Math.PI) % 360;

    // Add depth-based saturation
    const depth = index / config.pointCount;
    const saturation = 70 + depth * 30;

    // Add radius-based lightness
    const lightness = 50 + (radius / config.baseRadius) * 20;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Calculate 3D size based on position and depth
   */
  static calculate3DSize(index: number, config: Phyllotactic3DConfig): number {
    const baseSize = 2.0;
    const depth = index / config.pointCount;
    const sizeVariation = Math.sin(index * 0.1) * 0.5;

    // Size decreases with depth for perspective
    const depthScale = 1 - depth * 0.3;

    return Math.max(0.5, baseSize * depthScale + sizeVariation);
  }

  /**
   * Generate color palette for 3D phyllotactic points
   */
  static generateColorPalette(pointCount: number): string[] {
    const colors: string[] = [];
    const goldenAngle = (GOLDEN_ANGLE * Math.PI) / 180;

    for (let i = 0; i < pointCount; i++) {
      const angle = i * goldenAngle;
      const hue = ((angle * 180) / Math.PI) % 360;
      const saturation = 70 + (i / pointCount) * 30;
      const lightness = 50 + Math.sin(i * 0.1) * 20;

      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  }

  /**
   * Calculate size variations for 3D points
   */
  static calculateSizeVariations(pointCount: number): number[] {
    const sizes: number[] = [];
    const baseSize = 2.0;

    for (let i = 0; i < pointCount; i++) {
      const depth = i / pointCount;
      const sizeVariation = Math.sin(i * 0.1) * 0.5;
      const depthScale = 1 - depth * 0.3;

      sizes.push(Math.max(0.5, baseSize * depthScale + sizeVariation));
    }

    return sizes;
  }

  /**
   * Generate depth-based opacity values
   */
  static generateDepthOpacity(pointCount: number): number[] {
    const opacities: number[] = [];

    for (let i = 0; i < pointCount; i++) {
      const depth = i / pointCount;
      // Opacity decreases with depth for depth perception
      const opacity = 1 - depth * 0.4;
      opacities.push(Math.max(0.3, opacity));
    }

    return opacities;
  }

  /**
   * Calculate lighting intensity for 3D points
   */
  static calculateLightingIntensity(
    x: number,
    y: number,
    z: number,
    lightSource: { x: number; y: number; z: number } = { x: 0, y: 0, z: 100 }
  ): number {
    const distance = Math.sqrt(
      Math.pow(x - lightSource.x, 2) + Math.pow(y - lightSource.y, 2) + Math.pow(z - lightSource.z, 2)
    );

    // Inverse square law for lighting
    const maxDistance = 200;
    const intensity = Math.max(0.1, 1 - distance / maxDistance);

    return intensity;
  }
}
