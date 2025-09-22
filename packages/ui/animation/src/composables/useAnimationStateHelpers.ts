/**
 * Animation State Composable Helpers
 * 
 * Helper functions for the useAnimationState composable.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { AnimationStateManager, AnimationStateConfig } from "../state/AnimationStateManager";

/**
 * Performance optimization functions
 */
export function createPerformanceOptimizationFunctions(
  animationStateManager: () => AnimationStateManager | null
) {
  const enablePerformanceMode = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig({ enablePerformanceMode: true });
    }
  };

  const disablePerformanceMode = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig({ enablePerformanceMode: false });
    }
  };

  const resetPerformanceMetrics = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      // Reset metrics through the smart animation core
      const _core = stateManager.getState();
      // This would need to be implemented in the AnimationStateManager
    }
  };

  return {
    enablePerformanceMode,
    disablePerformanceMode,
    resetPerformanceMetrics,
  };
}

/**
 * Accessibility compliance functions
 */
export function createAccessibilityComplianceFunctions(
  animationStateManager: () => AnimationStateManager | null
) {
  const enableAccessibilityMode = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig({ enableAccessibilityChecks: true });
    }
  };

  const disableAccessibilityMode = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig({ enableAccessibilityChecks: false });
    }
  };

  return {
    enableAccessibilityMode,
    disableAccessibilityMode,
  };
}

/**
 * Immediate completion functions
 */
export function createImmediateCompletionFunctions(
  animationStateManager: () => AnimationStateManager | null
) {
  const enableImmediateCompletion = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig({ enableImmediateCompletion: true });
    }
  };

  const disableImmediateCompletion = () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig({ enableImmediateCompletion: false });
    }
  };

  return {
    enableImmediateCompletion,
    disableImmediateCompletion,
  };
}

/**
 * Create enhanced configuration for animation state manager
 */
export function createEnhancedConfig(config: Partial<AnimationStateConfig>): AnimationStateConfig {
  return {
    integrateGlobalControl: true,
    enablePerformanceMode: true,
    enableAccessibilityChecks: true,
    enableImmediateCompletion: true,
    enableStatePersistence: true,
    enableLogging: false,
    debounceDelay: 100,
    ...config,
  };
}
