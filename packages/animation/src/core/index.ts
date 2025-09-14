/**
 * 🦊 Animation Core
 * Core animation functionality exports
 */

export { createAnimationCore } from "./AnimationCore";
export { PerformanceMonitor } from "./PerformanceMonitor";

// Re-export types
export type {
  AnimationConfig,
  AnimationState,
  AnimationCallbacks,
  PerformanceStats,
  PerformanceMetrics,
  PerformanceThresholds,
} from "../types";
