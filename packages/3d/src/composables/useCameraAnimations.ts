// Camera animation composable for SolidJS
import { createSignal, createMemo } from "solid-js";
import type { CameraAnimation, EasingType } from "../types";
import { createCameraFlyToConfig, calculateCameraAnimationState } from "../utils/cameraAnimationUtils";
import { createAnimationFrameManager } from "../utils/animationFrameManager";

export function useCameraAnimations() {
  const [cameraAnimation, setCameraAnimation] = createSignal<CameraAnimation | null>(null);
  const frameManager = createAnimationFrameManager();

  const isAnimationsDisabled = createMemo(() => false);

  const createCameraFlyTo = (
    targetPosition: [number, number, number],
    targetLookAt: [number, number, number],
    duration: number = 1500,
    easing: EasingType = "easeInOutCubic"
  ): Promise<CameraAnimation> => {
    const animation = createCameraFlyToConfig(targetPosition, targetLookAt, duration, easing);

    if (isAnimationsDisabled()) {
      return Promise.resolve(animation);
    }

    return new Promise<CameraAnimation>(resolve => {
      setCameraAnimation(animation);
      resolve(animation);
    });
  };

  const getCameraAnimationState = (currentProgress: number) => {
    const anim = cameraAnimation();
    return anim ? calculateCameraAnimationState(anim, currentProgress) : null;
  };

  const stopAnimations = () => {
    frameManager.cancelFrame();
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
