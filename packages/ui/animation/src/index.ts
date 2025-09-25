/**
 * 🎭 Reynard Animation System
 *
 * Comprehensive animation system for the Reynard ecosystem
 */

// Main animation composables (the ones that actually work)
export { useStaggeredAnimation } from "./composables/useStaggeredAnimation";
export { useStrikeoutAnimation } from "./composables/useStrikeoutAnimation";
export { useAnimationState } from "./composables/useAnimationState";
export { useThreeDAnimation } from "./3d/useThreeDAnimation";

// Easing system
export { Easing, applyEasing, getEasingFunction, isValidEasingType } from "./easing/easing";
export type { EasingType } from "./easing/easing";

// Main types
export type * from "./types";

// Animation engines
export { NoOpAnimationEngine } from "./engines/NoOpAnimationEngine";

// Core functionality
export { createAnimationCore } from "./core/AnimationCore";
export { PerformanceMonitor } from "./core/PerformanceMonitor";

// Logging system
export { logger, log, enableDebugLogging, enableProductionLogging } from "./utils/Logger";
export type { LogLevel, LoggerConfig } from "./utils/Logger";
