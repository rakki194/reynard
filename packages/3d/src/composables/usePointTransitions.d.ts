import type { EmbeddingPoint, EasingType } from "../types";
export declare function usePointTransitions(): {
    createReductionTransition: (startPoints: EmbeddingPoint[], endPoints: EmbeddingPoint[], duration?: number, easing?: EasingType) => Promise<void>;
    currentAnimation: import("solid-js").Accessor<import("..").AnimationState | null>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    stopAnimations: () => void;
};
