/**
 * 🦊 Adaptive Animation Engine
 * Quality-adaptive animation engine that adjusts based on performance
 */
import type { AnimationCallbacks } from "../types";
export declare function createAdaptiveAnimationEngine(config?: import("./AdaptiveConfig").AdaptiveConfig): {
    start: (callbacks: AnimationCallbacks) => void;
    stop: () => void;
    reset: () => void;
    getCurrentQuality: () => number;
    getQualityLevel: () => number;
    animationState: import("solid-js").Accessor<import("..").ComposableAnimationState>;
    getPerformanceStats: () => import("..").PerformanceStats;
    updateConfig: (newConfig: Partial<import("..").AnimationConfig>) => void;
    updateCallbacks: (newCallbacks: AnimationCallbacks) => void;
};
