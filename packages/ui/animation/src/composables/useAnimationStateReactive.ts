/**
 * Animation State Composable Reactive State
 *
 * Reactive state getters for the useAnimationState composable.
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createMemo } from "solid-js";
import { AnimationState } from "../state/AnimationStateManager";

/**
 * Create reactive state getters
 */
export function createReactiveStateGetters(state: () => AnimationState) {
  const isGloballyDisabled = createMemo(() => state().isGloballyDisabled);
  const isPackageAvailable = createMemo(() => state().isPackageAvailable);
  const isPerformanceMode = createMemo(() => state().isPerformanceMode);
  const isAccessibilityMode = createMemo(() => state().isAccessibilityMode);
  const isFallbackMode = createMemo(() => state().isFallbackMode);
  const engineType = createMemo(() => state().engineType);
  const immediateCompletion = createMemo(() => state().immediateCompletion);
  const performanceMetrics = createMemo(() => state().performanceMetrics);
  const accessibilityCompliance = createMemo(() => state().accessibilityCompliance);
  const persistenceData = createMemo(() => state().persistenceData);

  return {
    isGloballyDisabled,
    isPackageAvailable,
    isPerformanceMode,
    isAccessibilityMode,
    isFallbackMode,
    engineType,
    immediateCompletion,
    performanceMetrics,
    accessibilityCompliance,
    persistenceData,
  };
}
