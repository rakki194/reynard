import type { AnimationState, EasingType } from "../types";
/**
 * Create animation loop for point transitions
 */
export declare function createAnimationLoop(animationState: AnimationState, duration: number, easing: EasingType, onUpdate: (progress: number) => void, onComplete: () => void): Promise<void>;
/**
 * Create cluster animation loop
 */
export declare function createClusterAnimationLoop(startTime: number, duration: number, easing: EasingType, onUpdate: (progress: number) => void, onComplete: () => void): Promise<void>;
