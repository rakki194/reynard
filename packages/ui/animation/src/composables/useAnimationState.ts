/**
 * Animation State Composable
 *
 * SolidJS composable for animation state management with global control integration.
 * Provides reactive state management, performance monitoring, and accessibility compliance.
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createMemo } from "solid-js";
import { AnimationStateManager, AnimationStateConfig, AnimationState } from "../state/AnimationStateManager";
import { SmartAnimationCore } from "../engines/SmartAnimationCore";
import {
  createPerformanceOptimizationFunctions,
  createAccessibilityComplianceFunctions,
  createImmediateCompletionFunctions,
} from "./useAnimationStateHelpers";
import { createReactiveStateGetters } from "./useAnimationStateReactive";
import { createStateManagementFunctions } from "./useAnimationStateManagement";
import { createAnimationStateInitialization } from "./useAnimationStateInitialization";

export interface UseAnimationStateOptions {
  /** Animation state manager configuration */
  config?: Partial<AnimationStateConfig>;
  /** Smart animation core instance */
  smartAnimationCore?: SmartAnimationCore;
  /** Whether to auto-initialize on mount */
  autoInitialize?: boolean;
}

export interface UseAnimationStateReturn {
  /** Whether the animation state manager is initialized */
  isInitialized: () => boolean;
  /** Current animation state */
  state: () => AnimationState;
  /** Whether animations are globally disabled */
  isGloballyDisabled: () => boolean;
  /** Whether the animation package is available */
  isPackageAvailable: () => boolean;
  /** Whether performance mode is active */
  isPerformanceMode: () => boolean;
  /** Whether accessibility mode is active */
  isAccessibilityMode: () => boolean;
  /** Whether fallback mode is active */
  isFallbackMode: () => boolean;
  /** Current engine type */
  engineType: () => "full" | "fallback" | "no-op";
  /** Whether immediate completion is enabled */
  immediateCompletion: () => boolean;
  /** Performance metrics */
  performanceMetrics: () => AnimationState["performanceMetrics"];
  /** Accessibility compliance status */
  accessibilityCompliance: () => AnimationState["accessibilityCompliance"];
  /** State persistence data */
  persistenceData: () => AnimationState["persistenceData"];
  /** Update performance metrics */
  updatePerformanceMetrics: (animationResult: { duration: number; usedFallback: boolean; usedNoOp: boolean }) => void;
  /** Update state manually */
  updateState: () => Promise<void>;
  /** Update configuration */
  updateConfig: (newConfig: Partial<AnimationStateConfig>) => void;
  /** Get the underlying animation state manager */
  getStateManager: () => AnimationStateManager;
  /** Performance optimization functions */
  enablePerformanceMode: () => void;
  disablePerformanceMode: () => void;
  resetPerformanceMetrics: () => void;
  /** Accessibility compliance functions */
  enableAccessibilityMode: () => void;
  disableAccessibilityMode: () => void;
  /** Immediate completion functions */
  enableImmediateCompletion: () => void;
  disableImmediateCompletion: () => void;
}

/**
 * Animation state composable with reactive state management
 */
export function useAnimationState(options: UseAnimationStateOptions = {}): UseAnimationStateReturn {
  // Create initialization logic
  const { isInitialized, animationStateManager } = createAnimationStateInitialization(options);

  // Reactive state getters
  const state = createMemo(() => {
    const stateManager = animationStateManager();
    return stateManager
      ? stateManager.getState()
      : {
          isGloballyDisabled: false,
          isPackageAvailable: false,
          isPerformanceMode: false,
          isAccessibilityMode: false,
          isFallbackMode: false,
          engineType: "no-op" as const,
          immediateCompletion: false,
          performanceMetrics: {
            averageAnimationTime: 0,
            totalAnimations: 0,
            disabledAnimations: 0,
            fallbackAnimations: 0,
            noOpAnimations: 0,
          },
          accessibilityCompliance: {
            respectsReducedMotion: false,
            respectsHighContrast: false,
            respectsReducedData: false,
            complianceScore: 0,
          },
          persistenceData: {
            lastUpdate: Date.now(),
            stateHistory: [],
            userPreferences: {},
          },
        };
  });

  // Create reactive state getters
  const reactiveState = createReactiveStateGetters(state);

  // Create state management functions
  const stateManagementFunctions = createStateManagementFunctions(animationStateManager);

  // Create helper function groups
  const performanceFunctions = createPerformanceOptimizationFunctions(animationStateManager);
  const accessibilityFunctions = createAccessibilityComplianceFunctions(animationStateManager);
  const immediateCompletionFunctions = createImmediateCompletionFunctions(animationStateManager);

  return {
    isInitialized,
    state,
    ...reactiveState,
    ...stateManagementFunctions,
    // Performance optimization functions
    ...performanceFunctions,
    // Accessibility compliance functions
    ...accessibilityFunctions,
    // Immediate completion functions
    ...immediateCompletionFunctions,
  };
}
