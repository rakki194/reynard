/**
 * Animation State Composable Hooks
 * 
 * Specialized hooks for the useAnimationState composable.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { useAnimationState } from "./useAnimationState";

/**
 * Hook for checking global animation state
 */
export function useGlobalAnimationState() {
  const { isGloballyDisabled, isInitialized } = useAnimationState();
  
  return {
    isGloballyDisabled,
    isInitialized,
    isEnabled: () => !isGloballyDisabled(),
  };
}

/**
 * Hook for checking performance mode state
 */
export function usePerformanceModeState() {
  const { isPerformanceMode, performanceMetrics, isInitialized } = useAnimationState();
  
  return {
    isPerformanceMode,
    performanceMetrics,
    isInitialized,
    isNormalMode: () => !isPerformanceMode(),
  };
}

/**
 * Hook for checking accessibility compliance
 */
export function useAccessibilityCompliance() {
  const { accessibilityCompliance, isInitialized } = useAnimationState();
  
  return {
    accessibilityCompliance,
    isInitialized,
    isFullyCompliant: () => accessibilityCompliance().complianceScore === 100,
    isPartiallyCompliant: () => accessibilityCompliance().complianceScore > 0,
  };
}

/**
 * Hook for checking animation package availability
 */
export function useAnimationPackageState() {
  const { isPackageAvailable, isFallbackMode, engineType, isInitialized } = useAnimationState();
  
  return {
    isPackageAvailable,
    isFallbackMode,
    engineType,
    isInitialized,
    isUsingFullEngine: () => engineType() === "full",
    isUsingFallbackEngine: () => engineType() === "fallback",
    isUsingNoOpEngine: () => engineType() === "no-op",
  };
}

/**
 * Hook for checking immediate completion state
 */
export function useImmediateCompletionState() {
  const { immediateCompletion, isGloballyDisabled, isInitialized } = useAnimationState();
  
  return {
    immediateCompletion,
    isGloballyDisabled,
    isInitialized,
    shouldCompleteImmediately: () => immediateCompletion() || isGloballyDisabled(),
  };
}
