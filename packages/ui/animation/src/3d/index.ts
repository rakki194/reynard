/**
 * 🦊 3D Animation Module
 * 
 * Unified 3D animation system with smart imports and fallback support.
 * Consolidates 3D animation functionality from across the Reynard codebase.
 */

// Core 3D animation functions
export * from "./ThreeDAnimationUtils.js";

// Smart import system
export * from "./ThreeDAnimationSystem.js";

// SolidJS composables
export * from "./useThreeDAnimation.js";

// CSS fallback utilities
export * from "./ThreeDFallbackUtils.js";

// Re-export types for convenience
export type {
  EmbeddingPoint,
  ClusterAnimation,
  PointAnimation,
  CameraAnimation,
  ThreeDAnimationOptions,
  ClusterAnimationOptions,
  PointAnimationOptions,
  CameraAnimationOptions,
  ThreeDAnimationState,
  ThreeDAnimationControls,
  UseThreeDAnimationReturn,
} from "./ThreeDAnimationTypes.js";

export type {
  ThreeDFallbackOptions,
} from "./ThreeDFallbackUtils.js";
