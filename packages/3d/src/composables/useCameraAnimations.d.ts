import type { CameraAnimation, EasingType } from "../types";
export declare function useCameraAnimations(): {
    cameraAnimation: import("solid-js").Accessor<CameraAnimation | null>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    createCameraFlyTo: (targetPosition: [number, number, number], targetLookAt: [number, number, number], duration?: number, easing?: EasingType) => Promise<CameraAnimation>;
    getCameraAnimationState: (currentProgress: number) => {
        position: [number, number, number];
        target: [number, number, number];
    } | null;
    stopAnimations: () => void;
};
