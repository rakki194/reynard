import type { CameraAnimation, EasingType } from "../types";
/**
 * Create camera fly-to animation configuration
 */
export declare const createCameraFlyToConfig: (targetPosition: [number, number, number], targetLookAt: [number, number, number], duration?: number, easing?: EasingType) => CameraAnimation;
/**
 * Calculate camera animation state at given progress
 */
export declare const calculateCameraAnimationState: (animation: CameraAnimation, progress: number) => {
    position: [number, number, number];
    target: [number, number, number];
};
