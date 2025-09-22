/**
 * Animation State Composable Initialization
 * 
 * Initialization logic for the useAnimationState composable.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { AnimationStateManager, AnimationStateConfig } from "../state/AnimationStateManager";
import { SmartAnimationCore } from "../engines/SmartAnimationCore";
import { createEnhancedConfig } from "./useAnimationStateHelpers";

export interface UseAnimationStateInitializationOptions {
  config?: Partial<AnimationStateConfig>;
  smartAnimationCore?: SmartAnimationCore;
  autoInitialize?: boolean;
}

/**
 * Create initialization logic for useAnimationState
 */
export function createAnimationStateInitialization(options: UseAnimationStateInitializationOptions) {
  const {
    config = {},
    smartAnimationCore,
    autoInitialize = true,
  } = options;

  const [isInitialized, setIsInitialized] = createSignal(false);
  const [animationStateManager, setAnimationStateManager] = createSignal<AnimationStateManager | null>(null);

  // Initialize the animation state manager with global control integration
  const initialize = async () => {
    if (isInitialized()) {
      return;
    }

    try {
      // Get or create smart animation core
      const core = smartAnimationCore || new SmartAnimationCore();
      
      // Create animation state manager with enhanced configuration
      const enhancedConfig = createEnhancedConfig(config);
      
      const stateManager = new AnimationStateManager(core, enhancedConfig);
      setAnimationStateManager(stateManager);
      setIsInitialized(true);
      
      if (enhancedConfig.enableLogging) {
        console.log("useAnimationState: Animation state manager initialized with global control integration");
      }
    } catch (error) {
      console.error("useAnimationState: Failed to initialize animation state manager:", error);
    }
  };

  // Auto-initialize on mount
  createEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    const stateManager = animationStateManager();
    if (stateManager) {
      stateManager.cleanup();
    }
  });

  return {
    isInitialized,
    animationStateManager,
    initialize,
  };
}
