/**
 * Staggered Animation Composable
 *
 * Manages staggered entrance and exit animations for floating panels.
 * Based on Yipyap's sophisticated animation timing system.
 */
import type { UseStaggeredAnimationReturn } from "../types.js";
export interface UseStaggeredAnimationOptions {
    baseDelay?: number;
    staggerStep?: number;
    maxDelay?: number;
    direction?: "forward" | "reverse" | "center-out";
    duration?: number;
    easing?: string;
    transform?: {
        entrance: string;
        exit: string;
        scale?: number;
        translateX?: number;
        translateY?: number;
    };
}
export declare function useStaggeredAnimation(options?: UseStaggeredAnimationOptions): UseStaggeredAnimationReturn;
