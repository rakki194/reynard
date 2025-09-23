/**
 * 🦊 3D Animation Composable
 * 
 * SolidJS composable for 3D animations with smart imports and fallbacks.
 * Integrates with the unified animation system.
 */

import { createSignal, createMemo, onCleanup } from "solid-js";
import type { 
  EmbeddingPoint,
  ClusterAnimationOptions,
  PointAnimationOptions,
  CameraAnimationOptions,
  ThreeDAnimationState,
  UseThreeDAnimationReturn,
  EasingType
} from "./ThreeDAnimationTypes.js";
import { getThreeDAnimationSystem } from "./ThreeDAnimationSystem.js";

export interface UseThreeDAnimationOptions {
  /** Default duration for animations */
  duration?: number;
  /** Default easing function */
  easing?: EasingType;
  /** Whether to use fallback animations when package unavailable */
  useFallback?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
  /** Whether to enable performance optimizations */
  performanceMode?: boolean;
}

/**
 * 3D animation composable with smart imports and fallbacks
 */
export function useThreeDAnimation(options: UseThreeDAnimationOptions = {}): UseThreeDAnimationReturn {
  const {
    duration = 800,
    easing = "easeOutElastic",
    useFallback = true,
    respectGlobalControl = true,
    performanceMode = false,
  } = options;

  // Get 3D animation system
  const threeDSystem = getThreeDAnimationSystem();
  const { state, controls } = threeDSystem;

  // Local state for reactive updates
  const [localPointAnimations, setLocalPointAnimations] = createSignal<EmbeddingPoint[]>([]);
  const [localClusterAnimations, setLocalClusterAnimations] = createSignal<EmbeddingPoint[]>([]);
  const [localCameraAnimations, setLocalCameraAnimations] = createSignal<EmbeddingPoint[]>([]);

  // Enhanced animation controls with reactive state
  const enhancedControls = {
    ...controls,
    
    createClusterAnimation: async (options: ClusterAnimationOptions) => {
      const enhancedOptions = {
        ...options,
        duration: options.duration || duration,
        easing: options.easing || easing,
        useFallback: options.useFallback ?? useFallback,
        respectGlobalControl: options.respectGlobalControl ?? respectGlobalControl,
        performanceMode: options.performanceMode ?? performanceMode,
      };

      await controls.createClusterAnimation(enhancedOptions);
      
      // Update local state for reactivity
      setLocalClusterAnimations(prev => [...prev, ...options.points]);
    },

    createPointAnimation: async (options: PointAnimationOptions) => {
      const enhancedOptions = {
        ...options,
        duration: options.duration || duration,
        easing: options.easing || easing,
        useFallback: options.useFallback ?? useFallback,
        respectGlobalControl: options.respectGlobalControl ?? respectGlobalControl,
        performanceMode: options.performanceMode ?? performanceMode,
      };

      await controls.createPointAnimation(enhancedOptions);
      
      // Update local state for reactivity
      setLocalPointAnimations(prev => [...prev, ...options.targetPoints]);
    },

    createCameraAnimation: async (options: CameraAnimationOptions) => {
      const enhancedOptions = {
        ...options,
        duration: options.duration || duration,
        easing: options.easing || easing,
        useFallback: options.useFallback ?? useFallback,
        respectGlobalControl: options.respectGlobalControl ?? respectGlobalControl,
        performanceMode: options.performanceMode ?? performanceMode,
      };

      await controls.createCameraAnimation(enhancedOptions);
    },

    stopAllAnimations: () => {
      controls.stopAllAnimations();
      setLocalPointAnimations([]);
      setLocalClusterAnimations([]);
      setLocalCameraAnimations([]);
    },

    stopAnimation: (animationId: string) => {
      controls.stopAnimation(animationId);
      // Note: Local state cleanup would need more sophisticated tracking
    },
  };

  // Reactive animation state
  const reactiveState = createMemo((): ThreeDAnimationState => ({
    pointAnimations: [], // Would need to track from system
    clusterAnimations: [], // Would need to track from system
    cameraAnimations: [], // Would need to track from system
    isAnimationsDisabled: state.isAnimationsDisabled(),
    animationEngine: state.animationEngine(),
  }));

  // Cleanup on unmount
  onCleanup(() => {
    enhancedControls.stopAllAnimations();
  });

  return {
    state: reactiveState,
    controls: enhancedControls,
    isSystemAvailable: () => state.is3DPackageAvailable(),
    animationEngine: state.animationEngine,
    isAnimationsDisabled: state.isAnimationsDisabled,
  };
}

/**
 * Hook for cluster animations specifically
 */
export function useClusterAnimation(options: UseThreeDAnimationOptions = {}) {
  const threeDAnimation = useThreeDAnimation(options);
  
  return {
    ...threeDAnimation,
    createClusterAnimation: threeDAnimation.controls.createClusterAnimation,
    stopClusterAnimations: () => {
      // Stop only cluster animations
      // Implementation would need to track cluster animation IDs
    },
  };
}

/**
 * Hook for point animations specifically
 */
export function usePointAnimation(options: UseThreeDAnimationOptions = {}) {
  const threeDAnimation = useThreeDAnimation(options);
  
  return {
    ...threeDAnimation,
    createPointAnimation: threeDAnimation.controls.createPointAnimation,
    stopPointAnimations: () => {
      // Stop only point animations
      // Implementation would need to track point animation IDs
    },
  };
}

/**
 * Hook for camera animations specifically
 */
export function useCameraAnimation(options: UseThreeDAnimationOptions = {}) {
  const threeDAnimation = useThreeDAnimation(options);
  
  return {
    ...threeDAnimation,
    createCameraAnimation: threeDAnimation.controls.createCameraAnimation,
    stopCameraAnimations: () => {
      // Stop only camera animations
      // Implementation would need to track camera animation IDs
    },
  };
}

/**
 * Hook for 3D visualization with animations
 */
export function useThreeDVisualization(options: UseThreeDAnimationOptions = {}) {
  const threeDAnimation = useThreeDAnimation(options);
  
  return {
    ...threeDAnimation,
    // Additional visualization-specific methods would go here
    getInterpolatedPoints: threeDAnimation.controls.getInterpolatedPoints,
    getCameraAnimationState: threeDAnimation.controls.getCameraAnimationState,
    updateAnimations: threeDAnimation.controls.updateAnimations,
  };
}
