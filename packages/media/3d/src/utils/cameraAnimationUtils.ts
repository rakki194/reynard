// Camera animation utility functions
import type { CameraAnimation, EasingType } from "../types";

/**
 * Create camera fly-to animation configuration
 */
export const createCameraFlyToConfig = (
  targetPosition: [number, number, number],
  targetLookAt: [number, number, number],
  duration: number = 1500,
  easing: EasingType = "easeInOutCubic"
): CameraAnimation => ({
  startPosition: [0, 0, 0], // Will be set by component
  endPosition: targetPosition,
  startTarget: [0, 0, 0], // Will be set by component
  endTarget: targetLookAt,
  duration,
  easing,
});

/**
 * Calculate camera animation state at given progress
 */
export const calculateCameraAnimationState = (animation: CameraAnimation, progress: number) => {
  return {
    position: [
      animation.startPosition[0] + (animation.endPosition[0] - animation.startPosition[0]) * progress,
      animation.startPosition[1] + (animation.endPosition[1] - animation.startPosition[1]) * progress,
      animation.startPosition[2] + (animation.endPosition[2] - animation.startPosition[2]) * progress,
    ] as [number, number, number],
    target: [
      animation.startTarget[0] + (animation.endTarget[0] - animation.startTarget[0]) * progress,
      animation.startTarget[1] + (animation.endTarget[1] - animation.startTarget[1]) * progress,
      animation.startTarget[2] + (animation.endTarget[2] - animation.startTarget[2]) * progress,
    ] as [number, number, number],
  };
};
