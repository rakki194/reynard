/**
 * 🦊 Color Animation Module
 *
 * Unified color animation system with smart imports and fallback support.
 * Consolidates color animation functionality from across the Reynard codebase.
 */

// Core color animation functions
export * from "./ColorAnimations.js";

// Smart import system
export * from "./ColorAnimationSystem.js";

// SolidJS composables
export * from "./useColorAnimation.js";

// CSS fallback utilities
export * from "./ColorFallbackUtils.js";

// Re-export types for convenience
export type { ColorAnimationOptions, HueShiftOptions } from "./ColorAnimations.js";

export type { ColorAnimationSystemState } from "./ColorAnimationSystem.js";

export type { UseColorAnimationOptions, UseColorAnimationReturn } from "./useColorAnimation.js";

export type { ColorFallbackOptions } from "./ColorFallbackUtils.js";
