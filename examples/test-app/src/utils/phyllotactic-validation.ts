/**
 * 🦊 Phyllotactic Validation & Performance Utilities
 * Validation and performance analysis for phyllotactic configurations
 */

import { GOLDEN_ANGLE } from "./phyllotactic-constants";
import type { SpiralConfig } from "./spiral-calculations";

/**
 * Calculate stroboscopic effect parameters
 * @param rotationSpeed - Rotation speed in degrees per frame
 * @param frameRate - Target frame rate
 * @param goldenAngle - The golden angle in degrees
 */
export function calculateStroboscopicEffect(
  rotationSpeed: number,
  _frameRate: number = 60,
  goldenAngle: number = GOLDEN_ANGLE,
): {
  isStroboscopic: boolean;
  stroboscopicPhase: number;
  apparentMotion: "growing" | "shrinking" | "frozen";
} {
  const rotationPerFrame = rotationSpeed;
  const stroboscopicPhase = (rotationPerFrame / goldenAngle) % 1;

  let apparentMotion: "growing" | "shrinking" | "frozen" = "frozen";
  let isStroboscopic = false;

  // Check if we're close to the golden angle for stroboscopic effect
  if (Math.abs(rotationPerFrame - goldenAngle) < 0.1) {
    isStroboscopic = true;
    apparentMotion = "frozen";
  } else if (rotationPerFrame > goldenAngle) {
    isStroboscopic = true;
    apparentMotion = "growing";
  } else if (rotationPerFrame < goldenAngle) {
    isStroboscopic = true;
    apparentMotion = "shrinking";
  }

  return {
    isStroboscopic,
    stroboscopicPhase,
    apparentMotion,
  };
}

/**
 * Validate phyllotactic parameters
 */
export function validatePhyllotacticConfig(config: SpiralConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.baseRadius < 0) {
    errors.push("Base radius must be non-negative");
  }

  if (config.growthFactor <= 0) {
    errors.push("Growth factor must be positive");
  }

  if (config.baseRadius > 100) {
    warnings.push("Large base radius may cause performance issues");
  }

  if (config.growthFactor > 10) {
    warnings.push("Large growth factor may create sparse patterns");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate performance metrics for phyllotactic patterns
 */
export function calculatePerformanceMetrics(
  pointCount: number,
  frameRate: number = 60,
): {
  pointsPerFrame: number;
  estimatedFPS: number;
  memoryUsage: number; // in MB
  complexity: "low" | "medium" | "high";
} {
  const pointsPerFrame = pointCount;
  const estimatedFPS = Math.max(30, frameRate - pointCount / 1000);
  const memoryUsage = (pointCount * 32) / (1024 * 1024); // Rough estimate

  let complexity: "low" | "medium" | "high" = "low";
  if (pointCount > 500) complexity = "high";
  else if (pointCount > 200) complexity = "medium";

  return {
    pointsPerFrame,
    estimatedFPS,
    memoryUsage,
    complexity,
  };
}
