import type { AnimationState, EasingType } from "../types";
export declare function useAnimationState(): {
    currentAnimation: import("solid-js").Accessor<AnimationState | null>;
    setCurrentAnimation: import("solid-js").Setter<AnimationState | null>;
    animationFrameId: import("solid-js").Accessor<number | null>;
    setAnimationFrameId: import("solid-js").Setter<number | null>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    createAnimationState: (duration: number, easing: EasingType) => AnimationState;
    stopAnimations: () => void;
};
