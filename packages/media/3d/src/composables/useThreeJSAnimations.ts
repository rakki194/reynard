// Main Three.js animations orchestrator for SolidJS
// Migrated to use unified animation system
import { onCleanup } from "solid-js";
import type { EmbeddingPoint, EasingType } from "../types";
import { usePointAnimations } from "./usePointAnimations";
import { useCameraAnimations } from "./useCameraAnimations";
import { useClusterAnimations } from "./useClusterAnimations";
import { Easing } from "../utils/easing";

// Smart import for unified animation system
let animationPackage: unknown = null;
let isPackageAvailable = false;

const checkAnimationPackageAvailability = async () => {
  try {
    const packageCheck = await import("reynard-animation");
    if (packageCheck && packageCheck.useThreeJSAnimations) {
      animationPackage = packageCheck;
      isPackageAvailable = true;
      return true;
    }
  } catch (error) {
    console.warn("🦊 3D: reynard-animation package not available, using fallback 3D animations");
  }
  return false;
};

// Initialize package availability
checkAnimationPackageAvailability();

export function useThreeJSAnimations() {
  const pointAnimations = usePointAnimations();
  const cameraAnimations = useCameraAnimations();
  const clusterAnimations = useClusterAnimations();

  /**
   * Get interpolated point positions for all animation types
   */
  const getInterpolatedPoints = (originalPoints: EmbeddingPoint[]) => {
    // First apply point animations
    let points = pointAnimations.getInterpolatedPoints(originalPoints);

    // Then apply cluster animations
    points = clusterAnimations.getInterpolatedClusterPoints(points);

    return points;
  };

  /**
   * Get camera animation state
   */
  const getCameraAnimationState = () => {
    const currentAnim = pointAnimations.currentAnimation();
    if (!currentAnim) return null;

    return cameraAnimations.getCameraAnimationState(currentAnim.progress);
  };

  /**
   * Stop all animations
   */
  const stopAllAnimations = () => {
    pointAnimations.stopAnimations();
    cameraAnimations.stopAnimations();
    clusterAnimations.stopAnimations();
  };

  /**
   * Update all animations
   */
  const updateAnimations = () => {
    const current = pointAnimations.currentAnimation();
    if (!current || !current.isAnimating) return;

    const now = performance.now();
    const elapsed = now - current.startTime;
    const progress = Math.min(elapsed / current.duration, 1);

    if (progress >= 1) {
      stopAllAnimations();
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    stopAllAnimations();
  });

  return {
    // State
    currentAnimation: pointAnimations.currentAnimation,
    pointAnimations: pointAnimations.pointAnimations,
    cameraAnimation: cameraAnimations.cameraAnimation,
    clusterAnimations: clusterAnimations.clusterAnimations,
    isAnimationsDisabled: pointAnimations.isAnimationsDisabled,

    // Methods
    createReductionTransition: pointAnimations.createReductionTransition,
    createClusterAnimation: clusterAnimations.createClusterAnimation,
    createCameraFlyTo: cameraAnimations.createCameraFlyTo,
    getInterpolatedPoints,
    getCameraAnimationState,
    stopAllAnimations,
    updateAnimations,

    // Utilities
    Easing,
  };
}
