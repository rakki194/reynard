/**
 * 🦊 Reynard Animation Package
 * Unified animation system for Reynard
 *
 * This package consolidates all animation functionality from across the codebase:
 * - Core animation engines from test-app
 * - 3D animations from packages/3d
 * - Staggered animations from packages/ui/floating-panel
 * - Easing functions from packages/colors and packages/3d
 * - Performance monitoring and optimization
 */

// Core exports
export * from "./composables";
export * from "./core";
export * from "./easing/easing";
export * from "./engines";
// Note: utils exports are included in composables to avoid conflicts

// Main types
export type * from "./types";

// Convenience exports for common use cases
export { useAnimationState, useStaggeredAnimation, useStrikeoutAnimation } from "./composables";
export { createAnimationCore } from "./core/AnimationCore";
export { PerformanceMonitor } from "./core/PerformanceMonitor";
export { Easing, applyEasing, interpolate } from "./easing/easing";
export { createAdaptiveAnimationEngine } from "./engines/AdaptiveAnimation";
export { StroboscopicEngine } from "./engines/StroboscopicEngine";
export { createThrottledAnimationEngine } from "./engines/ThrottledAnimation";
