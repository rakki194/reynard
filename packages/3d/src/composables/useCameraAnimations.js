// Camera animation composable for SolidJS
import { createSignal, createMemo } from "solid-js";
import { createCameraFlyToConfig, calculateCameraAnimationState, } from "../utils/cameraAnimationUtils";
import { createAnimationFrameManager } from "../utils/animationFrameManager";
export function useCameraAnimations() {
    const [cameraAnimation, setCameraAnimation] = createSignal(null);
    const frameManager = createAnimationFrameManager();
    const isAnimationsDisabled = createMemo(() => false);
    const createCameraFlyTo = (targetPosition, targetLookAt, duration = 1500, easing = "easeInOutCubic") => {
        const animation = createCameraFlyToConfig(targetPosition, targetLookAt, duration, easing);
        if (isAnimationsDisabled()) {
            return Promise.resolve(animation);
        }
        return new Promise((resolve) => {
            setCameraAnimation(animation);
            resolve(animation);
        });
    };
    const getCameraAnimationState = (currentProgress) => {
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
