/**
 * 🦊 Animation Loop Utilities
 * Unified animation loop system from 3D package
 */
import type { EasingType } from "../types";
export interface AnimationState {
    isAnimating: boolean;
    progress: number;
    startTime: number;
    duration: number;
    easing: EasingType;
}
/**
 * Create animation loop for point transitions
 */
export declare function createAnimationLoop(animationState: AnimationState, duration: number, easing: EasingType, onUpdate: (progress: number) => void, onComplete: () => void): Promise<void>;
/**
 * Create cluster animation loop
 */
export declare function createClusterAnimationLoop(startTime: number, duration: number, easing: EasingType, onUpdate: (progress: number) => void, onComplete: () => void): Promise<void>;
/**
 * Create a simple animation loop with custom timing
 */
export declare function createSimpleAnimationLoop(duration: number, easing: EasingType, onUpdate: (progress: number) => void, onComplete?: () => void): Promise<void>;
/**
 * Create a repeating animation loop
 */
export declare function createRepeatingAnimationLoop(duration: number, easing: EasingType, onUpdate: (progress: number) => void, onCycleComplete?: () => void, maxCycles?: number): () => void;
/**
 * Create a ping-pong animation loop (forward then reverse)
 */
export declare function createPingPongAnimationLoop(duration: number, easing: EasingType, onUpdate: (progress: number) => void, onComplete?: () => void): Promise<void>;
