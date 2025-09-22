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
export * from "./smart-imports";
export * from "./state";
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
export { 
  NoOpAnimationEngine, 
  getNoOpAnimationEngine, 
  createNoOpAnimationEngine, 
  cleanupNoOpAnimationEngine 
} from "./engines/NoOpAnimationEngine";
export { 
  NoOpTestingUtilities, 
  createNoOpTestingUtilities 
} from "./engines/NoOpTestingUtilities";

// Smart animation system exports
export { 
  SmartAnimationCore, 
  getSmartAnimationCore, 
  createSmartAnimationCore,
  cleanupSmartAnimationCore 
} from "./engines/SmartAnimationCore";
export { 
  useSmartAnimation, 
  useAnimationEngineType, 
  useAnimationPackageAvailability, 
  useAnimationPerformanceMode, 
  useAnimationAccessibilityMode 
} from "./composables/useSmartAnimation";
export { 
  useAnimationState 
} from "./composables/useAnimationState";
export { 
  useGlobalAnimationState, 
  usePerformanceModeState, 
  useAccessibilityCompliance, 
  useAnimationPackageState, 
  useImmediateCompletionState 
} from "./composables/useAnimationStateHooks";

// Animation state management exports
export { 
  AnimationStateManager, 
  getAnimationStateManager, 
  createAnimationStateManager,
  cleanupAnimationStateManager 
} from "./state/AnimationStateManager";

// Smart import system exports
export { 
  SmartImportSystem, 
  getSmartImportSystem, 
  createSmartImportSystem,
  cleanupSmartImportSystem 
} from "./smart-imports/SmartImportSystem";
export { 
  useSmartImport, 
  usePackageAvailability, 
  useMultiplePackageAvailability 
} from "./smart-imports/useSmartImport";
