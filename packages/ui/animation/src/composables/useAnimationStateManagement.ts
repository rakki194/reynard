/**
 * Animation State Composable State Management
 *
 * State management functions for the useAnimationState composable.
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { AnimationStateManager, AnimationStateConfig } from "../state/AnimationStateManager";

/**
 * Create state management functions
 */
export function createStateManagementFunctions(animationStateManager: () => AnimationStateManager | null) {
  const updatePerformanceMetrics = (animationResult: {
    duration: number;
    usedFallback: boolean;
    usedNoOp: boolean;
  }) => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updatePerformanceMetrics(animationResult);
    }
  };

  const updateState = async () => {
    const stateManager = animationStateManager();
    if (stateManager) {
      await stateManager.updateState();
    }
  };

  const updateConfig = (newConfig: Partial<AnimationStateConfig>) => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.updateConfig(newConfig);
    }
  };

  const getStateManager = () => {
    const stateManager = animationStateManager();
    if (!stateManager) {
      throw new Error("Animation state manager not initialized");
    }
    return stateManager;
  };

  return {
    updatePerformanceMetrics,
    updateState,
    updateConfig,
    getStateManager,
  };
}
