/**
 * 🦊 Animation Composables
 * SolidJS composables for animation functionality
 */

export { useAnimationState } from "./useAnimationState";
export { useStaggeredAnimation } from "./useStaggeredAnimation";
export { useStrikeoutAnimation } from "./useStrikeoutAnimation";
export { 
  useGlobalAnimationState, 
  usePerformanceModeState, 
  useAccessibilityCompliance, 
  useAnimationPackageState, 
  useImmediateCompletionState 
} from "./useAnimationStateHooks";
export { 
  useSmartAnimation, 
  useAnimationEngineType, 
  useAnimationPackageAvailability, 
  useAnimationPerformanceMode, 
  useAnimationAccessibilityMode 
} from "./useSmartAnimation";
export { 
  useEnhancedAnimationState, 
  useGlobalAnimationState, 
  usePerformanceModeState, 
  useAccessibilityCompliance, 
  useAnimationPackageState, 
  useImmediateCompletionState 
} from "./useEnhancedAnimationState";

// Re-export types
export type {
  AnimationState as ComposableAnimationState,
  StaggeredAnimationConfig,
  StaggeredAnimationItem,
  UseStaggeredAnimationOptions,
  UseStaggeredAnimationReturn,
} from "../types";

export type { StrikeoutAnimationOptions, StrikeoutAnimationState } from "./useStrikeoutAnimation";
