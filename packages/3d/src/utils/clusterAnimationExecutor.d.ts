import type { EasingType } from "../types";
export interface AnimationExecutorOptions {
    duration: number;
    easing: EasingType;
    onProgress: (progress: number) => void;
    onComplete: () => void;
}
/**
 * Execute cluster animation with progress tracking
 */
export declare function executeClusterAnimation(options: AnimationExecutorOptions): Promise<void>;
