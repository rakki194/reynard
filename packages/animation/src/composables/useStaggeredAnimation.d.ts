/**
 * 🦊 Staggered Animation Composable
 * Unified staggered animation system from floating-panel package
 */
import type { StaggeredAnimationItem, EasingType } from "../types";
export interface UseStaggeredAnimationOptions {
    duration?: number;
    delay?: number;
    stagger?: number;
    easing?: EasingType;
    direction?: "forward" | "reverse" | "center" | "random";
    onStart?: () => void;
    onComplete?: () => void;
    onItemStart?: (index: number) => void;
    onItemComplete?: (index: number) => void;
}
export interface UseStaggeredAnimationReturn {
    items: () => StaggeredAnimationItem[];
    isAnimating: () => boolean;
    start: (itemCount: number) => Promise<void>;
    stop: () => void;
    reset: () => void;
}
export declare function useStaggeredAnimation(options?: UseStaggeredAnimationOptions): UseStaggeredAnimationReturn;
