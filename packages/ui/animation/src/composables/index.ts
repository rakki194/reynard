/**
 * 🦊 Animation Composables
 * SolidJS composables for animation functionality
 */

export { useAnimationState } from "./useAnimationState";
export { useStaggeredAnimation } from "./useStaggeredAnimation";
export { useStrikeoutAnimation } from "./useStrikeoutAnimation";

// Re-export types
export type {
  AnimationState as ComposableAnimationState,
  StaggeredAnimationConfig,
  StaggeredAnimationItem,
  UseStaggeredAnimationOptions,
  UseStaggeredAnimationReturn,
} from "../types";

export type { StrikeoutAnimationOptions, StrikeoutAnimationState } from "./useStrikeoutAnimation";
