/**
 * 🦊 Phyllotactic Mathematical Constants
 * Core mathematical constants for phyllotactic spiral generation
 * Based on "The Mathematics of Phyllotactic Spirals and Their Animated Perception"
 */

/**
 * Mathematical constants from the research paper
 */
export const PHYLLOTACTIC_CONSTANTS = {
  // Golden ratio: φ = (1 + √5) / 2
  GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,

  // Golden angle: ψ = 360° / φ²
  GOLDEN_ANGLE_DEGREES: 360 / Math.pow((1 + Math.sqrt(5)) / 2, 2),

  // Golden angle in radians
  GOLDEN_ANGLE_RADIANS: ((360 / Math.pow((1 + Math.sqrt(5)) / 2, 2)) * Math.PI) / 180,

  // Vogel's model constants
  VOGEL_SCALING_FACTOR: 1.0,
} as const;

/**
 * Calculate the golden angle (137.50776°)
 */
export const GOLDEN_ANGLE = PHYLLOTACTIC_CONSTANTS.GOLDEN_ANGLE_DEGREES;

/**
 * Calculate the golden angle in radians
 */
export const GOLDEN_ANGLE_RADIANS = PHYLLOTACTIC_CONSTANTS.GOLDEN_ANGLE_RADIANS;

/**
 * Export golden ratio directly for convenience
 */
export const GOLDEN_RATIO = PHYLLOTACTIC_CONSTANTS.GOLDEN_RATIO;
