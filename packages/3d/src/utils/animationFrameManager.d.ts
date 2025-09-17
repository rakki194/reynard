/**
 * Animation frame manager for handling requestAnimationFrame lifecycle
 */
export declare function createAnimationFrameManager(): {
    animationFrameId: import("solid-js").Accessor<number | null>;
    requestFrame: (callback: FrameRequestCallback) => number;
    cancelFrame: () => void;
    isAnimating: () => boolean;
};
