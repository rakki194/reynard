import type { EmbeddingPoint, EasingType } from "../types";
export declare function useThreeJSAnimations(): {
    currentAnimation: import("solid-js").Accessor<import("..").AnimationState | null>;
    pointAnimations: import("solid-js").Accessor<import("..").PointAnimation[]>;
    cameraAnimation: import("solid-js").Accessor<import("..").CameraAnimation | null>;
    clusterAnimations: import("solid-js").Accessor<import("..").ClusterAnimation[]>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    createReductionTransition: (startPoints: EmbeddingPoint[], endPoints: EmbeddingPoint[], duration?: number, easing?: EasingType) => Promise<void>;
    createClusterAnimation: (clusterId: string, points: EmbeddingPoint[], center: [number, number, number], expansionRadius?: number, duration?: number, easing?: EasingType) => Promise<void>;
    createCameraFlyTo: (targetPosition: [number, number, number], targetLookAt: [number, number, number], duration?: number, easing?: EasingType) => Promise<import("..").CameraAnimation>;
    getInterpolatedPoints: (originalPoints: EmbeddingPoint[]) => EmbeddingPoint[];
    getCameraAnimationState: () => {
        position: [number, number, number];
        target: [number, number, number];
    } | null;
    stopAllAnimations: () => void;
    updateAnimations: () => void;
    Easing: {
        linear: (t: number) => number;
        easeInQuad: (t: number) => number;
        easeOutQuad: (t: number) => number;
        easeInOutQuad: (t: number) => number;
        easeInCubic: (t: number) => number;
        easeOutCubic: (t: number) => number;
        easeInOutCubic: (t: number) => number;
        easeInElastic: (t: number) => number;
        easeOutElastic: (t: number) => number;
        easeInOutElastic: (t: number) => number;
    };
};
