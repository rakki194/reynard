/**
 * 🦊 Spiral Position Calculations
 * Core functions for calculating phyllotactic spiral positions
 */

import { GOLDEN_ANGLE_RADIANS } from "./phyllotactic-constants";

/**
 * Configuration for spiral generation
 */
export interface SpiralConfig {
  baseRadius: number;
  growthFactor: number;
  centerX: number;
  centerY: number;
  scalingFactor?: number;
}

/**
 * Calculate spiral position using Vogel's model
 * @param index - The index of the element (0, 1, 2, ...)
 * @param rotationAngle - Additional rotation angle in radians
 * @param config - Configuration for spiral generation
 */
export function calculateSpiralPosition(
  index: number,
  rotationAngle: number = 0,
  config: SpiralConfig,
): { x: number; y: number; radius: number; angle: number } {
  const angle = (index * GOLDEN_ANGLE_RADIANS + rotationAngle) % (2 * Math.PI);
  const radius = config.baseRadius + Math.sqrt(index) * config.growthFactor;

  return {
    x: config.centerX + Math.cos(angle) * radius,
    y: config.centerY + Math.sin(angle) * radius,
    radius,
    angle,
  };
}

/**
 * Generate phyllotactic pattern data
 * @param pointCount - Number of points to generate
 * @param config - Spiral configuration
 * @param rotationAngle - Current rotation angle
 */
export function generatePhyllotacticPattern(
  pointCount: number,
  config: SpiralConfig,
  rotationAngle: number = 0,
): Array<{
  index: number;
  x: number;
  y: number;
  radius: number;
  angle: number;
}> {
  const points = [];

  for (let i = 0; i < pointCount; i++) {
    const position = calculateSpiralPosition(i, rotationAngle, config);
    points.push({
      index: i,
      ...position,
    });
  }

  return points;
}
