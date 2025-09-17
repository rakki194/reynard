/**
 * 🦊 Animation Core
 * Core animation loop and state management - unified from test-app
 */
import type { AnimationConfig, AnimationState, AnimationCallbacks, PerformanceStats } from "../types";
export declare function createAnimationCore(initialConfig: AnimationConfig): {
    animationState: import("solid-js").Accessor<AnimationState>;
    start: (newCallbacks: AnimationCallbacks) => void;
    stop: () => void;
    getPerformanceStats: () => PerformanceStats;
    updateConfig: (newConfig: Partial<AnimationConfig>) => void;
    updateCallbacks: (newCallbacks: AnimationCallbacks) => void;
    reset: () => void;
};
