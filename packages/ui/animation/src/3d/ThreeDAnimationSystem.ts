/**
 * 🦊 3D Animation System
 *
 * Smart import system for 3D animations with fallback support.
 * Integrates with the unified animation system.
 */

import { log } from "reynard-error-boundaries";
import type {
  EmbeddingPoint,
  ClusterAnimation,
  PointAnimation,
  CameraAnimation,
  ClusterAnimationOptions,
  PointAnimationOptions,
  CameraAnimationOptions,
  ThreeDAnimationState,
  ThreeDAnimationControls,
  EasingType,
} from "./ThreeDAnimationTypes.js";
import {
  interpolateVector3,
  interpolateEmbeddingPoint,
  getInterpolatedClusterPoints,
  getInterpolatedPointPositions,
  executeClusterAnimation,
  executePointAnimation,
  executeCameraAnimation,
  createClusterAnimationInstance,
  createPointAnimationInstance,
  createCameraAnimationInstance,
  shouldDisable3DAnimations,
  is3DAnimationPackageAvailable,
} from "./ThreeDAnimationUtils.js";

/**
 * Smart import system for 3D animation package
 */
async function import3DAnimationPackage(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const threeDModule = await import("reynard-3d" as string);
    return threeDModule;
  } catch (error) {
    log.warn("3D package not available, using fallback", undefined, {
      component: "ThreeDAnimationSystem",
      function: "checkThreeDPackageAvailability",
    });
    return null;
  }
}

/**
 * Import fallback animation system
 */
async function importFallbackSystem(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const fallbackModule = await import("reynard-composables" as string);
    return (fallbackModule as Record<string, unknown>).useAnimationFallback;
  } catch (error) {
    log.warn("Fallback system not available", undefined, {
      component: "ThreeDAnimationSystem",
      function: "checkFallbackAvailability",
    });
    return null;
  }
}

/**
 * Import global animation control
 */
async function importGlobalControl(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const controlModule = await import("reynard-composables" as string);
    return (controlModule as Record<string, unknown>).useAnimationControl;
  } catch (error) {
    log.warn("Global animation control not available", undefined, {
      component: "ThreeDAnimationSystem",
      function: "checkGlobalAnimationControl",
    });
    return null;
  }
}

export interface ThreeDAnimationSystemState {
  /** Current animation engine being used */
  animationEngine: () => "full" | "fallback" | "disabled";
  /** Whether animations are currently disabled */
  isAnimationsDisabled: () => boolean;
  /** Whether 3D package is available */
  is3DPackageAvailable: () => boolean;
}

/**
 * Create 3D animation system with smart imports
 */
export function createThreeDAnimationSystem(): {
  state: ThreeDAnimationSystemState;
  controls: ThreeDAnimationControls;
} {
  let animationEngine: "full" | "fallback" | "disabled" = "full";
  let isAnimationsDisabled = false;
  let is3DPackageAvailable = false;
  let fallbackSystem: unknown = null;
  let globalControl: unknown = null;

  // Animation state
  let pointAnimations: PointAnimation[] = [];
  let clusterAnimations: ClusterAnimation[] = [];
  let cameraAnimations: CameraAnimation[] = [];

  // Initialize animation system
  const initializeAnimationSystem = async () => {
    try {
      // Try to import global animation control first
      const controlModule = await importGlobalControl();
      if (controlModule) {
        globalControl = controlModule;
      }

      // Try to import 3D package
      const threeDModule = await import3DAnimationPackage();
      if (threeDModule) {
        is3DPackageAvailable = true;
        animationEngine = "full";
        return;
      }

      // Fallback to CSS-based animations
      const fallbackModule = await importFallbackSystem();
      if (fallbackModule) {
        fallbackSystem = fallbackModule;
        animationEngine = "fallback";
        return;
      }

      // No animation system available
      animationEngine = "disabled";
    } catch (error) {
      log.warn("Failed to initialize animation system", error, undefined, {
        component: "ThreeDAnimationSystem",
        function: "initializeThreeDAnimationSystem",
      });
      animationEngine = "disabled";
    }
  };

  // Initialize on creation
  initializeAnimationSystem();

  // Check if animations should be disabled
  const checkAnimationsDisabled = () => {
    if (animationEngine === "disabled") return true;

    if (globalControl) {
      const control = globalControl as Record<string, unknown>;
      const isDisabled = control.isAnimationsDisabled as (() => boolean) | undefined;
      return isDisabled?.() || false;
    }

    return shouldDisable3DAnimations();
  };

  // Enhanced 3D animation controls with smart imports
  const createClusterAnimation = async (options: ClusterAnimationOptions): Promise<void> => {
    if (checkAnimationsDisabled()) {
      return Promise.resolve(); // No animation when disabled
    }

    const clusterAnimation = createClusterAnimationInstance({
      clusterId: options.clusterId,
      points: options.points,
      center: options.center,
      expansionRadius: options.expansionRadius || 2,
      duration: options.duration || 800,
      easing: options.easing || "easeOutElastic",
    });

    clusterAnimations.push(clusterAnimation);

    return executeClusterAnimation({
      duration: clusterAnimation.duration,
      easing: clusterAnimation.easing,
      onProgress: (progress: number) => {
        clusterAnimations = clusterAnimations.map(cluster =>
          cluster.clusterId === options.clusterId ? { ...cluster, progress } : cluster
        );
      },
      onComplete: () => {
        clusterAnimations = clusterAnimations.filter(c => c.clusterId !== options.clusterId);
      },
    });
  };

  const createPointAnimation = async (options: PointAnimationOptions): Promise<void> => {
    if (checkAnimationsDisabled()) {
      return Promise.resolve(); // No animation when disabled
    }

    const pointAnimation = createPointAnimationInstance({
      animationId: options.animationId,
      startPoints: options.startPoints,
      targetPoints: options.targetPoints,
      duration: options.duration || 800,
      easing: options.easing || "easeOutElastic",
    });

    pointAnimations.push(pointAnimation);

    return executePointAnimation({
      duration: pointAnimation.duration,
      easing: pointAnimation.easing,
      onProgress: (progress: number) => {
        pointAnimations = pointAnimations.map(animation =>
          animation.animationId === options.animationId ? { ...animation, progress } : animation
        );
      },
      onComplete: () => {
        pointAnimations = pointAnimations.filter(a => a.animationId !== options.animationId);
      },
    });
  };

  const createCameraAnimation = async (options: CameraAnimationOptions): Promise<void> => {
    if (checkAnimationsDisabled()) {
      return Promise.resolve(); // No animation when disabled
    }

    const cameraAnimation = createCameraAnimationInstance({
      animationId: options.animationId,
      startPosition: options.startPosition,
      endPosition: options.endPosition,
      startTarget: options.startTarget,
      endTarget: options.endTarget,
      duration: options.duration || 800,
      easing: options.easing || "easeOutElastic",
    });

    cameraAnimations.push(cameraAnimation);

    return executeCameraAnimation({
      duration: cameraAnimation.duration,
      easing: cameraAnimation.easing,
      onProgress: (progress: number) => {
        cameraAnimations = cameraAnimations.map(animation =>
          animation.animationId === options.animationId ? { ...animation, progress } : animation
        );
      },
      onComplete: () => {
        cameraAnimations = cameraAnimations.filter(a => a.animationId !== options.animationId);
      },
    });
  };

  const stopAllAnimations = () => {
    pointAnimations = [];
    clusterAnimations = [];
    cameraAnimations = [];
  };

  const stopAnimation = (animationId: string) => {
    pointAnimations = pointAnimations.filter(a => a.animationId !== animationId);
    clusterAnimations = clusterAnimations.filter(c => c.clusterId !== animationId);
    cameraAnimations = cameraAnimations.filter(a => a.animationId !== animationId);
  };

  const getInterpolatedPoints = (originalPoints: EmbeddingPoint[]): EmbeddingPoint[] => {
    if (checkAnimationsDisabled()) {
      return originalPoints; // No interpolation when disabled
    }

    // First apply point animations
    let points = getInterpolatedPointPositions(originalPoints, pointAnimations);

    // Then apply cluster animations
    points = getInterpolatedClusterPoints(points, clusterAnimations);

    return points;
  };

  const getCameraAnimationState = (): CameraAnimation | null => {
    if (checkAnimationsDisabled()) {
      return null; // No camera animation when disabled
    }

    return cameraAnimations.find(a => a.isAnimating) || null;
  };

  const updateAnimations = () => {
    if (checkAnimationsDisabled()) {
      return; // No updates when disabled
    }

    const now = performance.now();

    // Update point animations
    pointAnimations = pointAnimations.filter(animation => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      if (progress >= 1) {
        return false; // Remove completed animation
      }

      return true;
    });

    // Update cluster animations
    clusterAnimations = clusterAnimations.filter(animation => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      if (progress >= 1) {
        return false; // Remove completed animation
      }

      return true;
    });

    // Update camera animations
    cameraAnimations = cameraAnimations.filter(animation => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      if (progress >= 1) {
        return false; // Remove completed animation
      }

      return true;
    });
  };

  const state: ThreeDAnimationSystemState = {
    animationEngine: () => animationEngine,
    isAnimationsDisabled: checkAnimationsDisabled,
    is3DPackageAvailable: () => is3DPackageAvailable,
  };

  const controls: ThreeDAnimationControls = {
    createClusterAnimation,
    createPointAnimation,
    createCameraAnimation,
    stopAllAnimations,
    stopAnimation,
    getInterpolatedPoints,
    getCameraAnimationState,
    updateAnimations,
  };

  return { state, controls };
}

/**
 * Global 3D animation system instance
 */
let globalThreeDAnimationSystem: ReturnType<typeof createThreeDAnimationSystem> | null = null;

/**
 * Get or create the global 3D animation system
 */
export function getThreeDAnimationSystem() {
  if (!globalThreeDAnimationSystem) {
    globalThreeDAnimationSystem = createThreeDAnimationSystem();
  }
  return globalThreeDAnimationSystem;
}

/**
 * Reset the global 3D animation system
 */
export function resetThreeDAnimationSystem() {
  globalThreeDAnimationSystem = null;
}
