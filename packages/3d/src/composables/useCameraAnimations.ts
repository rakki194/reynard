// Camera animation composable for SolidJS
import { createSignal, createMemo } from "solid-js";
import type { CameraAnimation, EasingType } from "../types";

export function useCameraAnimations() {
  const [cameraAnimation, setCameraAnimation] =
    createSignal<CameraAnimation | null>(null);
  const [animationFrameId, setAnimationFrameId] = createSignal<number | null>(
    null,
  );

  const isAnimationsDisabled = createMemo(() => false);

  /**
   * Create camera fly-to animation
   */
  const createCameraFlyTo = (
    targetPosition: [number, number, number],
    targetLookAt: [number, number, number],
    duration: number = 1500,
    easing: EasingType = "easeInOutCubic",
  ): Promise<CameraAnimation> => {
    if (isAnimationsDisabled()) {
      return Promise.resolve({
        startPosition: [0, 0, 0],
        endPosition: targetPosition,
        startTarget: [0, 0, 0],
        endTarget: targetLookAt,
        duration,
        easing,
      });
    }

    return new Promise<CameraAnimation>((resolve) => {
      const animation: CameraAnimation = {
        startPosition: [0, 0, 0], // Will be set by component
        endPosition: targetPosition,
        startTarget: [0, 0, 0], // Will be set by component
        endTarget: targetLookAt,
        duration,
        easing,
      };

      setCameraAnimation(animation);
      resolve(animation);
    });
  };

  /**
   * Get camera animation state
   */
  const getCameraAnimationState = (currentProgress: number) => {
    const anim = cameraAnimation();
    if (!anim) return null;

    const progress = currentProgress;

    return {
      position: [
        anim.startPosition[0] +
          (anim.endPosition[0] - anim.startPosition[0]) * progress,
        anim.startPosition[1] +
          (anim.endPosition[1] - anim.startPosition[1]) * progress,
        anim.startPosition[2] +
          (anim.endPosition[2] - anim.startPosition[2]) * progress,
      ],
      target: [
        anim.startTarget[0] +
          (anim.endTarget[0] - anim.startTarget[0]) * progress,
        anim.startTarget[1] +
          (anim.endTarget[1] - anim.startTarget[1]) * progress,
        anim.startTarget[2] +
          (anim.endTarget[2] - anim.startTarget[2]) * progress,
      ],
    };
  };

  const stopAnimations = () => {
    const currentId = animationFrameId();
    if (currentId) {
      window.cancelAnimationFrame(currentId);
      setAnimationFrameId(null);
    }
    setCameraAnimation(null);
  };

  return {
    cameraAnimation,
    isAnimationsDisabled,
    createCameraFlyTo,
    getCameraAnimationState,
    stopAnimations,
  };
}
