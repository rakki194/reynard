/**
 * 🦊 Animation State Composable
 * Unified animation state management for SolidJS
 */
import type { EasingType } from "../types";
export interface AnimationState {
    isAnimating: boolean;
    progress: number;
    startTime: number;
    duration: number;
    easing: EasingType;
}
export declare function useAnimationState(): {
    currentAnimation: import("solid-js").Accessor<AnimationState | null>;
    setCurrentAnimation: import("solid-js").Setter<AnimationState | null>;
    animationFrameId: import("solid-js").Accessor<number | null>;
    setAnimationFrameId: import("solid-js").Setter<number | null>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    createAnimationState: (duration: number, easing: EasingType) => AnimationState;
    stopAnimations: () => void;
};
