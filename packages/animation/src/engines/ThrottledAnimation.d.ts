/**
 * 🦊 Throttled Animation Engine
 * Performance-optimized animation engine with throttling
 */
import type { AnimationConfig, AnimationCallbacks } from "../types";
export declare function createThrottledAnimationEngine(config?: AnimationConfig & {
    throttleInterval: number;
}): {
    start: (callbacks: AnimationCallbacks) => void;
    animationState: import("solid-js").Accessor<import("..").ComposableAnimationState>;
    stop: () => void;
    getPerformanceStats: () => import("..").PerformanceStats;
    updateConfig: (newConfig: Partial<AnimationConfig>) => void;
    updateCallbacks: (newCallbacks: AnimationCallbacks) => void;
    reset: () => void;
};
