import type { PointAnimation, EasingType, EmbeddingPoint } from "../types";
export declare function usePointAnimations(): {
    currentAnimation: import("solid-js").Accessor<import("..").AnimationState | null>;
    pointAnimations: import("solid-js").Accessor<PointAnimation[]>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    createReductionTransition: (startPoints: EmbeddingPoint[], endPoints: EmbeddingPoint[], duration?: number, easing?: EasingType) => Promise<void>;
    getInterpolatedPoints: (originalPoints: EmbeddingPoint[]) => EmbeddingPoint[];
    stopAnimations: () => void;
};
