/**
 * 🦊 Strikeout Animation Composable
 * Smooth text strikeout animation for todo items and similar use cases
 */
import type { EasingType } from "../types";
export interface StrikeoutAnimationOptions {
    duration?: number;
    easing?: EasingType;
    delay?: number;
    onComplete?: () => void;
    onStart?: () => void;
}
export interface StrikeoutAnimationState {
    isAnimating: boolean;
    progress: number;
    isStruckOut: boolean;
}
export declare function useStrikeoutAnimation(options?: StrikeoutAnimationOptions): {
    isAnimating: import("solid-js").Accessor<boolean>;
    progress: import("solid-js").Accessor<number>;
    isStruckOut: import("solid-js").Accessor<boolean>;
    strikeOut: () => void;
    unStrikeOut: () => void;
    toggle: () => void;
    reset: () => void;
    getStrikeoutStyle: () => {
        width: string;
        opacity: number;
    };
    getTextStyle: () => {
        opacity: number;
        textDecoration: string;
    };
};
