/**
 * 🦊 Global Animation Module
 *
 * Global animation control system with centralized configuration and state management.
 * Provides unified control over all animation systems across the Reynard ecosystem.
 */

// Core global animation functions
export * from "./GlobalAnimationConfig.js";

// Global animation context
export * from "./useGlobalAnimationContext.js";

// Global animation controls
export * from "./GlobalAnimationControls.js";

// Global animation disable utilities
export * from "./GlobalAnimationDisableUtils.js";

// Global animation integration
export * from "./GlobalAnimationIntegration.js";

// Re-export types for convenience
export type {
  GlobalAnimationConfig,
  GlobalAnimationState,
  GlobalAnimationControls,
  UseGlobalAnimationContextReturn,
  GlobalAnimationContextOptions,
  SystemPreferences,
  AnimationPackageInfo,
  GlobalAnimationEvents,
  GlobalAnimationTesting,
  GlobalAnimationPersistence,
} from "./GlobalAnimationTypes.js";
