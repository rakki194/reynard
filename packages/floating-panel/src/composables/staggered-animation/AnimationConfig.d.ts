/**
 * Animation Configuration
 *
 * Configuration utilities for staggered animations.
 */
export interface AnimationConfig {
    baseDelay: number;
    staggerStep: number;
    maxDelay: number;
    direction: "forward" | "reverse" | "center-out";
    duration: number;
    easing: string;
    transform: {
        entrance: string;
        exit: string;
        scale?: number;
        translateX?: number;
        translateY?: number;
    };
}
/**
 * Create default animation configuration
 */
export declare function createDefaultAnimationConfig(): AnimationConfig;
